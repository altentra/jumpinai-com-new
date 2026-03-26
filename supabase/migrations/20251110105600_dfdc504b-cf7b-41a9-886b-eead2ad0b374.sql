-- Security Enhancement: Protect Subscribers Table

-- 1. Add manual_subscription flag to protect admin-created subscriptions
ALTER TABLE public.subscribers 
ADD COLUMN IF NOT EXISTS manual_subscription BOOLEAN DEFAULT false;

-- 2. Create audit log table for all subscription changes
CREATE TABLE IF NOT EXISTS public.subscription_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  email TEXT NOT NULL,
  action TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  changed_by TEXT,
  change_source TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.subscription_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Only service role can access audit logs"
ON public.subscription_audit_log
FOR ALL
USING (auth.jwt()->>'role' = 'service_role');

-- 3. Create trigger function to log all subscription changes
CREATE OR REPLACE FUNCTION public.log_subscription_changes()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log UPDATE operations
  IF (TG_OP = 'UPDATE') THEN
    INSERT INTO public.subscription_audit_log (
      user_id,
      email,
      action,
      old_data,
      new_data,
      change_source
    ) VALUES (
      NEW.user_id,
      NEW.email,
      'UPDATE',
      row_to_json(OLD)::jsonb,
      row_to_json(NEW)::jsonb,
      COALESCE(current_setting('app.change_source', true), 'unknown')
    );
    RETURN NEW;
  END IF;
  
  -- Log INSERT operations
  IF (TG_OP = 'INSERT') THEN
    INSERT INTO public.subscription_audit_log (
      user_id,
      email,
      action,
      new_data,
      change_source
    ) VALUES (
      NEW.user_id,
      NEW.email,
      'INSERT',
      row_to_json(NEW)::jsonb,
      COALESCE(current_setting('app.change_source', true), 'unknown')
    );
    RETURN NEW;
  END IF;
  
  -- Log DELETE operations
  IF (TG_OP = 'DELETE') THEN
    INSERT INTO public.subscription_audit_log (
      user_id,
      email,
      action,
      old_data,
      change_source
    ) VALUES (
      OLD.user_id,
      OLD.email,
      'DELETE',
      row_to_json(OLD)::jsonb,
      COALESCE(current_setting('app.change_source', true), 'unknown')
    );
    RETURN OLD;
  END IF;
  
  RETURN NULL;
END;
$$;

-- 4. Create trigger on subscribers table
DROP TRIGGER IF EXISTS subscription_changes_audit ON public.subscribers;
CREATE TRIGGER subscription_changes_audit
AFTER INSERT OR UPDATE OR DELETE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.log_subscription_changes();

-- 5. Add protection function against unauthorized modifications
CREATE OR REPLACE FUNCTION public.protect_manual_subscriptions()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Prevent modification of manual subscriptions unless explicitly allowed
  IF (TG_OP = 'UPDATE' AND OLD.manual_subscription = true) THEN
    -- Check if this is an authorized admin operation
    IF COALESCE(current_setting('app.allow_manual_override', true), 'false') != 'true' THEN
      RAISE EXCEPTION 'Cannot modify manual subscription. This subscription is protected.';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger to protect manual subscriptions
DROP TRIGGER IF EXISTS protect_manual_subscriptions ON public.subscribers;
CREATE TRIGGER protect_manual_subscriptions
BEFORE UPDATE ON public.subscribers
FOR EACH ROW
EXECUTE FUNCTION public.protect_manual_subscriptions();

-- 6. Mark existing manual subscription as protected
UPDATE public.subscribers 
SET manual_subscription = true
WHERE email = 'ivan.v.kruchok@gmail.com' 
AND subscribed = true;

-- Add helpful comments
COMMENT ON COLUMN public.subscribers.manual_subscription IS 'True if subscription was manually created by admin. Protected from automatic overwrites.';
COMMENT ON TABLE public.subscription_audit_log IS 'Audit trail for all subscription changes. Critical for security and compliance.';
COMMENT ON FUNCTION public.log_subscription_changes() IS 'Automatically logs all changes to subscribers table';
COMMENT ON FUNCTION public.protect_manual_subscriptions() IS 'Prevents unauthorized modification of manual subscriptions';