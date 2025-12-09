

import { Product, Store, Post, BlogPost } from './types';

export const MOCK_STORES: Store[] = [
  {
    id: 's1',
    name: 'مزون تهران',
    handle: '@tehran_maison',
    // FIX: Added missing 'slug' property to match the Store type.
    slug: 'tehran_maison',
    avatar: 'https://picsum.photos/100/100?random=1',
    coverImage: 'https://picsum.photos/800/300?random=1',
    followers: 12500,
    isFollowing: true,
    description: 'ارائه دهنده بهترین لباس‌های شب و مجلسی با طراحی اختصاصی.',
    // FIX: Added missing productIds property to match the Store type.
    productIds: [2, 5],
    reelIds: [],
  },
  {
    id: 's2',
    name: 'چرم مشهد',
    handle: '@mashhad_leather',
    // FIX: Added missing 'slug' property to match the Store type.
    slug: 'mashhad_leather',
    avatar: 'https://picsum.photos/100/100?random=2',
    coverImage: 'https://picsum.photos/800/300?random=2',
    followers: 45000,
    isFollowing: false,
    description: 'محصولات چرمی اصل با کیفیت صادراتی.',
    // FIX: Added missing productIds property to match the Store type.
    productIds: [1, 4],
    reelIds: [],
  },
  {
    id: 's3',
    name: 'استایل خیابانی',
    handle: '@street_style_ir',
    // FIX: Added missing 'slug' property to match the Store type.
    slug: 'street_style_ir',
    avatar: 'https://picsum.photos/100/100?random=3',
    coverImage: 'https://picsum.photos/800/300?random=3',
    followers: 8900,
    isFollowing: true,
    description: 'جدیدترین ترندهای مد خیابانی و کژوال.',
    // FIX: Added missing productIds property to match the Store type.
    productIds: [3, 6],
    reelIds: [],
  },
];

// FIX: Updated the MOCK_PRODUCTS array to conform to the new `Category` type.
export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'کت چرم کلاسیک مردانه',
    price: 4500000,
    finalPrice: 4050000,
    discountPercentage: 10,
    image: 'https://picsum.photos/400/500?random=10',
    description: 'کت چرم طبیعی گاوی با آستر ابریشم. مناسب برای فصول سرد سال. این محصول با استفاده از چرم‌های صادراتی درجه یک تولید شده و دارای گارانتی ۲ ساله چرم مشهد می‌باشد.',
    overview: null,
    inStock: true,
    storeId: 's2',
    category: { id: 1, category_name: 'کت و کاپشن', category_parent: 'لباس' },
    colors: [
      { id: 1, color_name: 'مشکی', color_hex: '#000000' },
      { id: 2, color_name: 'قهوه‌ای', color_hex: '#5D4037' },
      { id: 3, color_name: 'عسلی', color_hex: '#D2691E' }
    ],
    sizes: [
        { id: 1, size_name: 'M' },
        { id: 2, size_name: 'L' },
        { id: 3, size_name: 'XL' },
        { id: 4, size_name: 'XXL' },
    ],
  },
  {
    id: 'p2',
    name: 'پیراهن مجلسی شب',
    price: 2800000,
    finalPrice: 2800000,
    image: 'https://picsum.photos/400/500?random=11',
    category: { id: 2, category_name: 'پیراهن', category_parent: 'لباس' },
    storeId: 's1',
    description: 'پیراهن بلند مشکی با سنگ دوزی دستی. طراحی سال ۲۰۲۴. مناسب برای مجالس رسمی.',
    inStock: true,
    overview: null,
    colors: [
      { id: 5, color_name: 'مشکی', color_hex: '#000000' },
      { id: 6, color_name: 'زرشکی', color_hex: '#800020' }
    ],
    sizes: [
        { id: 7, size_name: '36' },
        { id: 8, size_name: '38' },
        { id: 9, size_name: '40' },
        { id: 10, size_name: '42' },
    ],
  },
  {
    id: 'p3',
    name: 'شلوار جین راسته',
    price: 980000,
    finalPrice: 980000,
    image: 'https://picsum.photos/400/500?random=12',
    category: { id: 3, category_name: 'شلوار', category_parent: 'لباس' },
    storeId: 's3',
    inStock: true,
    description: 'شلوار جین با کیفیت بالا و دوخت صنعتی. رنگ ثابت.',
    overview: null,
  },
  {
    id: 'p4',
    name: 'کیف دستی چرم',
    price: 1500000,
    finalPrice: 1500000,
    image: 'https://picsum.photos/400/500?random=13',
    category: { id: 4, category_name: 'کیف دستی', category_parent: 'اکسسوری' },
    storeId: 's2',
    inStock: true,
    description: 'کیف دستی زنانه مناسب برای استفاده روزمره و اداری.',
    overview: null,
  },
  {
    id: 'p5',
    name: 'مانتو تابستانه لینن',
    price: 1200000,
    finalPrice: 1200000,
    image: 'https://picsum.photos/400/500?random=14',
    category: { id: 2, category_name: 'مانتو', category_parent: 'لباس' },
    storeId: 's1',
    inStock: false,
    description: 'مانتو بسیار خنک و سبک از جنس الیاف طبیعی.',
    overview: null,
  },
    {
    id: 'p6',
    name: 'کفش کتانی سفید',
    price: 2100000,
    finalPrice: 2100000,
    image: 'https://picsum.photos/400/500?random=15',
    category: { id: 5, category_name: 'کفش ورزشی', category_parent: 'کفش' },
    storeId: 's3',
    inStock: true,
    description: 'راحت و طبی, مناسب پیاده‌روی طولانی.',
    overview: null,
  },
];

export const MOCK_POSTS: Post[] = [
  {
    id: 'post1',
    storeId: 's1',
    image: 'https://picsum.photos/600/600?random=20',
    caption: 'کالکشن جدید تابستانه ما رسید! ☀️😍 #مد #فشن #تابستان',
    likes: 234,
    comments: 12,
    linkedProductIds: ['p2', 'p5'],
  },
  {
    id: 'post2',
    storeId: 's3',
    image: 'https://picsum.photos/600/600?random=21',
    caption: 'ست کژوال برای قرارهای دوستانه. نظرتون چیه؟',
    likes: 567,
    comments: 45,
    linkedProductIds: ['p3', 'p6'],
  },
];

export const MOCK_BLOGS: BlogPost[] = [
  {
    id: 'b1',
    title: 'ترندهای رنگ سال ۱۴۰۳',
    excerpt: 'امسال چه رنگ‌هایی در دنیای مد ایران و جهان ترند شده‌اند؟ بررسی کامل پالت رنگی...',
    date: '۱۴۰۳/۰۲/۱۵',
    image: 'https://picsum.photos/800/400?random=30',
    content: 'متن کامل مقاله اینجا قرار می‌گیرد...',
    slug: 'color-trends-1403',
  },
  {
    id: 'b2',
    title: 'راهنمای خرید چرم اصل',
    excerpt: 'چگونه چرم طبیعی را از مصنوعی تشخیص دهیم؟ ۵ نکته کلیدی که باید بدانید.',
    date: '۱۴۰۳/۰۱/۲۰',
    image: 'https://picsum.photos/800/400?random=31',
    content: 'متن کامل مقاله اینجا قرار می‌گیرد...',
    slug: 'buying-genuine-leather',
  },
];

export const PRICE_RANGES = [
  { id: 'under_500k', label: 'زیر ۵۰۰ هزار تومان', min: 0, max: 500000 },
  { id: '500k_1m', label: '۵۰۰ هزار تا ۱ میلیون تومان', min: 500000, max: 1000000 },
  { id: '1m_2m', label: '۱ تا ۲ میلیون تومان', min: 1000000, max: 2000000 },
  { id: '2m_5m', label: '۲ تا ۵ میلیون تومان', min: 2000000, max: 5000000 },
  { id: '5m_10m', label: '۵ تا ۱۰ میلیون تومان', min: 5000000, max: 10000000 },
  { id: 'above_10m', label: 'بالای ۱۰ میلیون تومان', min: 10000000, max: Infinity },
];