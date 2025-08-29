'use client';

import { useState, useEffect } from 'react';

export default function TestProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      console.log('Fetching products...');
      const response = await fetch('/api/products?limit=100');
      const data = await response.json();
      
      console.log('API Response:', data);
      
      if (data.success && data.data) {
        setProducts(data.data);
        console.log('Products loaded:', data.data.length);
      } else {
        setError('No products found');
      }
    } catch (err: any) {
      console.error('Error fetching products:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Products Test Page</h1>
      
      <button 
        onClick={fetchProducts}
        className="mb-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Refresh Products
      </button>
      
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}
      
      <div className="mb-4">
        <strong>Total Products: {products.length}</strong>
      </div>
      
      {products.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <div key={product.id} className="border p-4 rounded">
              <h2 className="font-bold">{product.name}</h2>
              <p>Price: ₩{product.price}</p>
              <p>Category: {product.category}</p>
              <p>Active: {product.is_active ? 'Yes' : 'No'}</p>
              {product.image_url && (
                <img 
                  src={product.image_url} 
                  alt={product.name}
                  className="w-full h-48 object-cover mt-2"
                />
              )}
            </div>
          ))}
        </div>
      ) : (
        <p>No products found</p>
      )}
      
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Raw Data:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto">
          {JSON.stringify(products, null, 2)}
        </pre>
      </div>
    </div>
  );
}