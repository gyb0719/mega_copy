'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Search, Loader2 } from 'lucide-react';
import Header from '../components/Header';

interface ProductImage {
  id: string;
  image_url: string;
  display_order: number;
}

interface Product {
  id: string;
  name: string;
  brand: string;
  price: number;
  category: string;
  product_images?: ProductImage[];
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  
  const [searchQuery, setSearchQuery] = useState(query);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    if (query) {
      handleSearch(query);
    }
  }, [query]);

  const handleSearch = async (searchTerm: string) => {
    if (!searchTerm.trim()) return;
    
    setLoading(true);
    setHasSearched(true);
    
    try {
      const response = await fetch(`/api/products?search=${encodeURIComponent(searchTerm)}`);
      const result = await response.json();
      
      if (result.data) {
        setProducts(result.data);
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.history.pushState({}, '', `/search?q=${encodeURIComponent(searchQuery.trim())}`);
      handleSearch(searchQuery.trim());
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Search Form */}
        <form onSubmit={handleSubmit} className="md:hidden mb-6">
          <div className="flex items-center bg-white border rounded-lg overflow-hidden">
            <input
              type="text"
              placeholder="상품명, 브랜드 검색"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 px-4 py-3 outline-none"
              autoFocus
            />
            <button type="submit" className="bg-mega-black px-4 py-3 hover:bg-gray-800">
              <Search className="w-5 h-5 text-white" />
            </button>
          </div>
        </form>

        {/* Search Results Header */}
        {hasSearched && (
          <div className="mb-6">
            {loading ? (
              <h2 className="text-lg">검색 중...</h2>
            ) : (
              <h2 className="text-lg">
                {query ? (
                  <>
                    '<span className="font-bold">{query}</span>' 검색 결과 ({products.length}개)
                  </>
                ) : (
                  '검색 결과'
                )}
              </h2>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}

        {/* Search Results */}
        {!loading && hasSearched && (
          <>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {products.map((product) => {
                  const mainImage = product.product_images?.[0]?.image_url;
                  
                  return (
                    <Link 
                      key={product.id}
                      href={`/product/${product.id}`}
                      className="group cursor-pointer"
                    >
                      <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3 relative">
                        {mainImage ? (
                          <img
                            src={mainImage}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">상품 이미지</span>
                          </div>
                        )}
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-500">{product.brand}</p>
                        <h3 className="font-medium group-hover:text-mega-red transition-colors line-clamp-2">
                          {product.name}
                        </h3>
                        <p className="font-bold">₩{product.price.toLocaleString()}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-500 mb-2">검색 결과가 없습니다.</p>
                <p className="text-sm text-gray-400">다른 키워드로 검색해보세요.</p>
              </div>
            )}
          </>
        )}

        {/* Initial State */}
        {!loading && !hasSearched && (
          <div className="text-center py-20">
            <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">찾으시는 상품을 검색해보세요.</p>
            <p className="text-sm text-gray-400 mt-2">상품명이나 브랜드로 검색할 수 있습니다.</p>
          </div>
        )}
      </div>
    </div>
  );
}