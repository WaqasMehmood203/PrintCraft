import {
  Activity, Box, Briefcase, CreditCard, Factory, FileText, Globe, Image, Layers, Newspaper, Package, Palette, PenTool, Printer,
  Shield, Shirt, Sparkles, Sticker, Sun, Tag, Zap, type LucideIcon, type LucideProps,
} from 'lucide-react';

const ICONS: Record<string, LucideIcon> = {
  Shirt, Tag, Layers, Sparkles, Printer, Package, Box, FileText, Image, Sticker, CreditCard, Newspaper, PenTool, Palette, Zap, Shield, Sun, Factory, Briefcase, Globe, Activity,
};

export function DynamicIcon({ name, ...props }: { name: string } & LucideProps) {
  const C = ICONS[name] ?? Printer;
  return <C {...props} />;
}
