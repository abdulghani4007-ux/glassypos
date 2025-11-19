-- Create medicines table
CREATE TABLE public.medicines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  company TEXT NOT NULL,
  category TEXT NOT NULL,
  cost_price DECIMAL(10,2) NOT NULL,
  sale_price DECIMAL(10,2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  reorder_level INTEGER NOT NULL DEFAULT 0,
  expiry DATE NOT NULL,
  batch_number TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(name, company)
);

-- Create sales table
CREATE TABLE public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  items JSONB NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  discount DECIMAL(10,2) NOT NULL DEFAULT 0,
  tax DECIMAL(10,2) NOT NULL DEFAULT 0,
  total DECIMAL(10,2) NOT NULL,
  payment_type TEXT NOT NULL CHECK (payment_type IN ('cash', 'card', 'udhar')),
  cash_received DECIMAL(10,2),
  change_returned DECIMAL(10,2),
  customer_name TEXT,
  customer_phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create expenses table
CREATE TABLE public.expenses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  type TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  note TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create refunds table
CREATE TABLE public.refunds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  items JSONB NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create udhars table (credit/loans)
CREATE TABLE public.udhars (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_name TEXT NOT NULL,
  customer_phone TEXT,
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('paid', 'unpaid')) DEFAULT 'unpaid',
  date TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date DATE,
  paid_date DATE,
  invoice_no TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create settings table (global settings for the pharmacy)
CREATE TABLE public.settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shop_name TEXT NOT NULL DEFAULT 'My Pharmacy',
  currency TEXT NOT NULL DEFAULT 'PKR',
  default_tax DECIMAL(5,2) NOT NULL DEFAULT 0,
  default_discount DECIMAL(5,2) NOT NULL DEFAULT 0,
  invoice_prefix TEXT NOT NULL DEFAULT 'INV',
  invoice_footer TEXT,
  show_customer_info BOOLEAN NOT NULL DEFAULT true,
  enable_udhar BOOLEAN NOT NULL DEFAULT true,
  low_stock_threshold INTEGER NOT NULL DEFAULT 10,
  expiry_alert_days INTEGER NOT NULL DEFAULT 30,
  dark_mode BOOLEAN NOT NULL DEFAULT false,
  glassy_ui BOOLEAN NOT NULL DEFAULT true,
  compact_sidebar BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.settings (id) VALUES (gen_random_uuid());

-- Enable Row Level Security on all tables
ALTER TABLE public.medicines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.udhars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Create RLS policies (public access for now - since no auth is implemented yet)
-- Medicines policies
CREATE POLICY "Anyone can view medicines" ON public.medicines FOR SELECT USING (true);
CREATE POLICY "Anyone can insert medicines" ON public.medicines FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update medicines" ON public.medicines FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete medicines" ON public.medicines FOR DELETE USING (true);

-- Sales policies
CREATE POLICY "Anyone can view sales" ON public.sales FOR SELECT USING (true);
CREATE POLICY "Anyone can insert sales" ON public.sales FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update sales" ON public.sales FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete sales" ON public.sales FOR DELETE USING (true);

-- Expenses policies
CREATE POLICY "Anyone can view expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Anyone can insert expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update expenses" ON public.expenses FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete expenses" ON public.expenses FOR DELETE USING (true);

-- Refunds policies
CREATE POLICY "Anyone can view refunds" ON public.refunds FOR SELECT USING (true);
CREATE POLICY "Anyone can insert refunds" ON public.refunds FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update refunds" ON public.refunds FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete refunds" ON public.refunds FOR DELETE USING (true);

-- Udhars policies
CREATE POLICY "Anyone can view udhars" ON public.udhars FOR SELECT USING (true);
CREATE POLICY "Anyone can insert udhars" ON public.udhars FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update udhars" ON public.udhars FOR UPDATE USING (true);
CREATE POLICY "Anyone can delete udhars" ON public.udhars FOR DELETE USING (true);

-- Settings policies
CREATE POLICY "Anyone can view settings" ON public.settings FOR SELECT USING (true);
CREATE POLICY "Anyone can update settings" ON public.settings FOR UPDATE USING (true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_medicines_updated_at
  BEFORE UPDATE ON public.medicines
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON public.sales
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON public.expenses
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_refunds_updated_at
  BEFORE UPDATE ON public.refunds
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_udhars_updated_at
  BEFORE UPDATE ON public.udhars
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON public.settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();