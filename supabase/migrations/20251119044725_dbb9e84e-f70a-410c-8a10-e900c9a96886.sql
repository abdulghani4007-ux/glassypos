-- Add missing columns to refunds table for enhanced refund tracking
ALTER TABLE public.refunds 
ADD COLUMN IF NOT EXISTS invoice_no TEXT,
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'completed' CHECK (status IN ('completed', 'pending')),
ADD COLUMN IF NOT EXISTS customer_name TEXT,
ADD COLUMN IF NOT EXISTS customer_phone TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_refunds_sale_id ON public.refunds(sale_id);
CREATE INDEX IF NOT EXISTS idx_refunds_date ON public.refunds(date);
CREATE INDEX IF NOT EXISTS idx_refunds_status ON public.refunds(status);

-- Update RLS policies remain the same (already set to allow all operations)