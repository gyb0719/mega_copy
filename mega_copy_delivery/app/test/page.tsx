'use client'

import { useState, useEffect } from 'react'

export default function TestPage() {
  const [status, setStatus] = useState('loading...')
  const [products, setProducts] = useState<any[]>([])
  const [error, setError] = useState('')

  useEffect(() => {
    testAPI()
  }, [])

  const testAPI = async () => {
    try {
      const response = await fetch('https://nzmscqfrmxqcukhshsok.supabase.co/rest/v1/rpc/get_products', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bXNjcWZybXhxY3VraHNoc29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTg1NDMsImV4cCI6MjA3MTc5NDU0M30.o0zQtPEjsuJnfQnY2MiakuM2EvTlVuRO9yeoajrwiLU',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          limit_count: 10,
          offset_count: 0,
          search_query: '',
          category_filter: ''
        })
      })

      const data = await response.json()
      console.log('API Response:', data)

      if (response.ok) {
        setStatus('API 연결 성공!')
        if (data && data.data) {
          setProducts(data.data)
        } else if (Array.isArray(data)) {
          setProducts(data)
        } else {
          setProducts([])
        }
      } else {
        setStatus('API 오류')
        setError(JSON.stringify(data, null, 2))
      }
    } catch (err: any) {
      setStatus('연결 실패')
      setError(err.message)
    }
  }

  const addTestProduct = async () => {
    try {
      const response = await fetch('https://nzmscqfrmxqcukhshsok.supabase.co/rest/v1/rpc/add_product', {
        method: 'POST',
        headers: {
          'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im56bXNjcWZybXhxY3VraHNoc29rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyMTg1NDMsImV4cCI6MjA3MTc5NDU0M30.o0zQtPEjsuJnfQnY2MiakuM2EvTlVuRO9yeoajrwiLU',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          product_name: 'Test Product ' + Date.now(),
          product_price: 10000,
          product_description: 'Test description',
          product_category: 'Test',
          product_stock: 10
        })
      })

      if (response.ok) {
        alert('Product added!')
        testAPI()
      } else {
        const error = await response.json()
        alert('Error: ' + JSON.stringify(error))
      }
    } catch (err: any) {
      alert('Error: ' + err.message)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-4">Test Page</h1>
      
      <div className="bg-gray-100 p-4 rounded mb-4">
        <p className="font-bold">Status: {status}</p>
        {error && (
          <pre className="bg-red-100 p-2 mt-2 text-red-800 text-sm">
            {error}
          </pre>
        )}
      </div>

      <button 
        onClick={testAPI}
        className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
      >
        Test API
      </button>

      <button 
        onClick={addTestProduct}
        className="bg-green-500 text-white px-4 py-2 rounded"
      >
        Add Test Product
      </button>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-2">Products ({products.length})</h2>
        {products.length === 0 ? (
          <p className="text-gray-500">No products found. Click "Add Test Product" to create one.</p>
        ) : (
          <div className="grid gap-2">
            {products.map((product, idx) => (
              <div key={idx} className="bg-white p-3 rounded shadow">
                <p className="font-bold">{product.name}</p>
                <p className="text-gray-600">Price: {product.price}원</p>
                <p className="text-gray-600">Stock: {product.stock}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-8 bg-gray-100 p-4 rounded">
        <h3 className="font-bold mb-2">Debug Info:</h3>
        <pre className="text-xs overflow-auto">
          {JSON.stringify({ productsCount: products.length, products }, null, 2)}
        </pre>
      </div>
    </div>
  )
}