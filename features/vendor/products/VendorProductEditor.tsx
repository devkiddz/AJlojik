import Link from 'next/link';

import { ProductStudioFields, type ProductStudioMedia, type ProductStudioVariant } from '@/features/admin/products/ProductStudioFields';
import { adminFieldClass } from '@/features/admin/components';

export type VendorProductEditorProduct = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string | null;
  longDescription: string | null;
  categoryId: string;
  subcategoryId: string | null;
  brandId: string | null;
  tags: string[];
  isNew: boolean;
  estimatedDelivery: string | null;
  discountPercentage: number;
  status: string;
  images: { mediaAssetId: string | null }[];
  variants: ProductStudioVariant[];
};

type Taxonomy = {
  categories: { id: string; label: string; subcategories: { id: string; label: string }[] }[];
  brands: { id: string; name: string }[];
};

export function VendorProductEditor({ product, media, taxonomy, action }: { product?: VendorProductEditorProduct; media: ProductStudioMedia[]; taxonomy: Taxonomy; action: (formData: FormData) => void | Promise<void> }) {
  const initialMediaIds = product?.images.map(image => image.mediaAssetId).filter((value): value is string => Boolean(value)) ?? [];
  const initialVariants = product?.variants ?? [];
  return (
    <form action={action} className="space-y-5">
      <section className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg sm:p-6">
        <div className="grid gap-4 lg:grid-cols-3">
          <Field label="Product name"><input name="name" defaultValue={product?.name} required className={adminFieldClass} /></Field>
          <Field label="Slug"><input name="slug" defaultValue={product?.slug} className={adminFieldClass} /></Field>
          <Field label="Category"><select name="categoryId" defaultValue={product?.categoryId} required className={adminFieldClass}><option value="">Select category</option>{taxonomy.categories.map(category => <option key={category.id} value={category.id}>{category.label}</option>)}</select></Field>
          <Field label="Subcategory"><select name="subcategoryId" defaultValue={product?.subcategoryId ?? ''} className={adminFieldClass}><option value="">No subcategory</option>{taxonomy.categories.flatMap(category => category.subcategories.map(subcategory => <option key={subcategory.id} value={subcategory.id}>{category.label} · {subcategory.label}</option>))}</select></Field>
          <Field label="Brand"><select name="brandId" defaultValue={product?.brandId ?? ''} className={adminFieldClass}><option value="">No brand</option>{taxonomy.brands.map(brand => <option key={brand.id} value={brand.id}>{brand.name}</option>)}</select></Field>
          <Field label="Estimated delivery"><input name="estimatedDelivery" defaultValue={product?.estimatedDelivery ?? ''} className={adminFieldClass} /></Field>
          <Field label="Tags"><input name="tags" defaultValue={product?.tags.join(', ')} className={adminFieldClass} placeholder="wine, premium, gift" /></Field>
          <Field label="Discount %"><input name="discountPercentage" type="number" min="0" max="100" defaultValue={product?.discountPercentage ?? 0} className={adminFieldClass} /></Field>
          <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-border/60 bg-background/60 px-4 text-xs font-bold"><input type="checkbox" name="isNew" defaultChecked={product?.isNew ?? true} /> Mark as new</label>
          <Field label="Short description" className="lg:col-span-3"><textarea name="shortDescription" rows={2} defaultValue={product?.shortDescription ?? ''} className={adminFieldClass} /></Field>
          <Field label="Full description" className="lg:col-span-3"><textarea name="longDescription" rows={5} defaultValue={product?.longDescription ?? ''} className={adminFieldClass} /></Field>
        </div>
      </section>

      <ProductStudioFields media={media} initialMediaIds={initialMediaIds} initialVariants={initialVariants} apiBasePath="/api/vendor/media" />

      <section className="rounded-[2rem] border border-border/60 bg-card/75 p-5 shadow-lg sm:p-6">
        <h2 className="font-black">Submission</h2>
        <p className="mt-1 text-xs leading-5 text-muted-foreground">Vendor products never publish directly. Save a draft or submit it to the workspace approval queue.</p>
        <div className="mt-4 flex flex-col gap-3 sm:flex-row">
          <button name="status" value="DRAFT" className="h-12 rounded-full border border-border px-6 text-sm font-bold">Save draft</button>
          <button name="status" value="PENDING_REVIEW" className="h-12 rounded-full bg-foreground px-6 text-sm font-bold text-background">Submit for approval</button>
          <Link href="/vendor/products" className="h-12 rounded-full px-6 text-center text-sm font-bold leading-[3rem] text-muted-foreground">Cancel</Link>
        </div>
      </section>
    </form>
  );
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return <label className={className}><span className="mb-2 block text-[9px] font-bold uppercase tracking-[0.14em] text-muted-foreground">{label}</span>{children}</label>;
}
