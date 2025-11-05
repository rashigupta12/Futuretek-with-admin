import { Button } from '@/components/ui/button'
import {
  ProductListThumbnail,
  ProductListThumbnailSkeleton,
} from '@/components/product-list-thumbnail'
import { productListSchema } from '@/lib/schema'
import Link from 'next/link'
import { z } from 'zod'

export function ProductList({
  list,
}: {
  list: z.infer<typeof productListSchema>
}) {
  return (
    <div className="relative mb-8 flex flex-col items-center gap-8">
      {list.data.length > 0 ? (
        <>
          <div className="grid w-full grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {list.data.map(product => (
              <ProductListThumbnail key={product.id} product={product} />
            ))}
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="#">View all products</Link>
          </Button>
        </>
      ) : (
        <>
          <div className="grid w-full grid-cols-1 gap-8 opacity-40 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 3 }).map((_, index) => (
              <ProductListThumbnailSkeleton key={index} />
            ))}
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 text-center text-sm">
            <div className="font-medium">No products found.</div>
            <div className="text-muted-foreground mb-4">
              Add products to your store to get started.
            </div>
            <Button asChild size="sm" variant="outline">
              <a
                href="https://dashboard.stripe.com/test/products"
                target="_blank"
              >
                Add Product
              </a>
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

