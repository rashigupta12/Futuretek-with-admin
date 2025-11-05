import { ProductBuyForm } from '@/components/product-buy-form'
import { productSchema } from '@/lib/schema'
import Image from 'next/image'
import { z } from 'zod'

export function ProductListThumbnail({
  product,
}: {
  product: z.infer<typeof productSchema>
}) {
  return (
    <div className="bg-background">
      <div className="ring-border relative aspect-square overflow-hidden rounded-xl ring-1">
        <Image
          src={product.images?.[0] ?? '/placeholder.svg'}
          alt={product.name}
          width={400}
          height={400}
          className="size-full object-cover"
        />
      </div>
      <div className="flex items-center gap-2 py-2">
        <div className="flex flex-col gap-1">
          <div className="font-medium">{product.name}</div>
          <div className="text-muted-foreground">
            {product.price.display_amount}
          </div>
        </div>
        <div className="ml-auto">
          <ProductBuyForm priceId={product.price.id} />
        </div>
      </div>
    </div>
  )
}

export function ProductListThumbnailSkeleton() {
  return <div className="bg-muted aspect-square rounded-xl" />
}

