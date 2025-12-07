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
  },
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'کت چرم کلاسیک مردانه',
    price: 4500000,
    discount: 10,
    image: 'https://picsum.photos/400/500?random=10',
    gallery: [
      'https://picsum.photos/400/500?random=10',
      'https://picsum.photos/400/500?random=101',
      'https://picsum.photos/400/500?random=102',
      'https://picsum.photos/400/500?random=103',
    ],
    category: 'کت و کاپشن',
    storeId: 's2',
    vendorType: 'Retail',
    description: 'کت چرم طبیعی گاوی با آستر ابریشم. مناسب برای فصول سرد سال. این محصول با استفاده از چرم‌های صادراتی درجه یک تولید شده و دارای گارانتی ۲ ساله چرم مشهد می‌باشد.',
    stock: 5,
    availability: 'Low Stock',
    colors: [
      { name: 'مشکی', hex: '#000000' },
      { name: 'قهوه‌ای', hex: '#5D4037' },
      { name: 'عسلی', hex: '#D2691E' }
    ],
    sizes: ['M', 'L', 'XL', 'XXL'],
    details: {
      material: 'چرم طبیعی گاوی',
      texture: 'دانه دار',
      season: 'پاییز و زمستان',
      style: 'کلاسیک / رسمی',
      origin: 'ایران'
    },
    reels: [
      { id: 'r1', thumbnail: 'https://picsum.photos/200/300?random=200', url: '#' },
      { id: 'r2', thumbnail: 'https://picsum.photos/200/300?random=201', url: '#' },
    ],
    reviews: [
      { id: 'rv1', user: 'علی محمدی', avatar: 'https://picsum.photos/50/50?random=300', rating: 5, date: '۱۴۰۳/۰۲/۱۰', comment: 'بسیار با کیفیت و خوش دوخت. سایزش هم دقیق بود.' },
      { id: 'rv2', user: 'سارا جلالی', avatar: 'https://picsum.photos/50/50?random=301', rating: 4, date: '۱۴۰۳/۰۱/۲۵', comment: 'جنس چرم عالیه ولی کمی سنگینه.' }
    ]
  },
  {
    id: 'p2',
    name: 'پیراهن مجلسی شب',
    price: 2800000,
    image: 'https://picsum.photos/400/500?random=11',
    gallery: ['https://picsum.photos/400/500?random=11', 'https://picsum.photos/400/500?random=111'],
    category: 'لباس زنانه',
    storeId: 's1',
    vendorType: 'Boutique',
    description: 'پیراهن بلند مشکی با سنگ دوزی دستی. طراحی سال ۲۰۲۴. مناسب برای مجالس رسمی.',
    stock: 12,
    availability: 'In Stock',
    colors: [
      { name: 'مشکی', hex: '#000000' },
      { name: 'زرشکی', hex: '#800020' }
    ],
    sizes: ['36', '38', '40', '42'],
    details: {
      material: 'کرپ مازراتی',
      texture: 'صاف و لخت',
      season: 'چهار فصل',
      style: 'مجلسی'
    },
    reviews: []
  },
  {
    id: 'p3',
    name: 'شلوار جین راسته',
    price: 980000,
    image: 'https://picsum.photos/400/500?random=12',
    category: 'شلوار',
    storeId: 's3',
    stock: 20,
    availability: 'In Stock',
    description: 'شلوار جین با کیفیت بالا و دوخت صنعتی. رنگ ثابت.',
  },
  {
    id: 'p4',
    name: 'کیف دستی چرم',
    price: 1500000,
    image: 'https://picsum.photos/400/500?random=13',
    category: 'اکسسوری',
    storeId: 's2',
    stock: 3,
    availability: 'Low Stock',
    description: 'کیف دستی زنانه مناسب برای استفاده روزمره و اداری.',
  },
  {
    id: 'p5',
    name: 'مانتو تابستانه لینن',
    price: 1200000,
    image: 'https://picsum.photos/400/500?random=14',
    category: 'لباس زنانه',
    storeId: 's1',
    stock: 0,
    availability: 'Out of Stock',
    description: 'مانتو بسیار خنک و سبک از جنس الیاف طبیعی.',
  },
    {
    id: 'p6',
    name: 'کفش کتانی سفید',
    price: 2100000,
    image: 'https://picsum.photos/400/500?random=15',
    category: 'کفش',
    storeId: 's3',
    stock: 8,
    availability: 'In Stock',
    description: 'راحت و طبی، مناسب پیاده‌روی طولانی.',
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
  },
  {
    id: 'b2',
    title: 'راهنمای خرید چرم اصل',
    excerpt: 'چگونه چرم طبیعی را از مصنوعی تشخیص دهیم؟ ۵ نکته کلیدی که باید بدانید.',
    date: '۱۴۰۳/۰۱/۲۰',
    image: 'https://picsum.photos/800/400?random=31',
    content: 'متن کامل مقاله اینجا قرار می‌گیرد...',
  },
];