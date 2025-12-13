import { readItems } from '@directus/sdk';
import { directus, getAssetUrl } from './client';
import { Order } from '../types';
import { DirectusOrder, DirectusOrderItem, DirectusProduct, DirectusStore } from '../types/directus';

export const orderService = {
  /**
   * Fetch orders for the current user.
   * Assumes permissions are set to 'User Created'.
   */
  getMyOrders: async (): Promise<Order[]> => {
    try {
      // 1. Fetch Orders. We request 'items' to get the IDs of the order items.
      const ordersResult = await directus.request(readItems('orders', {
        fields: [
          '*',
          { store: ['id', 'store_name', 'store_logo', 'store_slug'] },
          'items' // This returns an array of IDs (e.g., [9, 10])
        ],
        filter: {
           user_created: { _eq: '$CURRENT_USER' }
        },
        sort: ['-date_created']
      })) as unknown as DirectusOrder[];

      // 2. Collect all IDs from all orders to make a single batch request for items
      const allItemIds = ordersResult.flatMap(o => {
        if (Array.isArray(o.items)) {
          return o.items.map(i => (typeof i === 'number' ? i : i.id));
        }
        return [];
      }).filter(id => typeof id === 'number');

      // 3. Fetch the details of these order items
      const itemsMap = new Map<number, any>();
      
      if (allItemIds.length > 0) {
        // Fetch order_items. 
        // We assume 'product' relates to 'inventory', which then relates to 'product' (actual details).
        // We request nested fields to handle this structure.
        const itemsResult = await directus.request(readItems('order_items', {
          fields: [
            '*',
            // Fetch nested product via inventory structure: order_items -> inventory -> product
            { 
              product: [
                'id', 
                // We request the nested product object which contains the actual name/image
                { product: ['id', 'product_name', 'product_image'] } 
              ] 
            }
          ],
          filter: {
            id: { _in: allItemIds }
          },
          limit: -1
        })) as unknown as any[];

        itemsResult.forEach(item => {
          itemsMap.set(item.id, item);
        });
      }

      // 4. Map orders with the fetched items
      return ordersResult.map(order => mapOrder(order, itemsMap));
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      // Return empty array instead of throwing to prevent UI crash
      return [];
    }
  }
};

const mapOrder = (item: DirectusOrder, itemsMap?: Map<number, any>): Order => {
  const store = item.store as DirectusStore;
  
  // Resolve items from IDs to Objects using the map
  let resolvedItems: any[] = [];
  
  if (Array.isArray(item.items)) {
     item.items.forEach(i => {
         if (typeof i === 'number') {
             const details = itemsMap?.get(i);
             if (details) resolvedItems.push(details);
         } else {
             // If expansion somehow worked or mixed data
             resolvedItems.push(i);
         }
     });
  }

  const items = resolvedItems.map(i => {
     // Logic to find the actual product data object.
     // It might be directly in `i.product` OR nested in `i.product.product` (if inventory is used).
     let productData = i.product;
     
     if (productData && typeof productData === 'object') {
       // If the immediate product object has a 'product' property that is also an object, 
       // it means we are dealing with Inventory -> Product relation.
       if (productData.product && typeof productData.product === 'object') {
         productData = productData.product;
       }
     }

     return {
       id: i.id,
       productId: String(productData?.id || '0'),
       productName: productData?.product_name || 'محصول (نامشخص)',
       productImage: getAssetUrl(productData?.product_image),
       quantity: Number(i.quantity || 1),
       unitPrice: Number(i.unit_price || 0),
       totalPrice: Number(i.total || i.total_price || 0)
     };
  });

  return {
    id: item.id,
    status: item.status,
    date: new Date(item.date_created).toLocaleDateString('fa-IR'),
    total: Number(item.order_total),
    trackingCode: item.order_trackid,
    storeName: store?.store_name || 'فروشگاه',
    storeSlug: store?.store_slug || '',
    storeLogo: getAssetUrl(store?.store_logo),
    items
  };
};