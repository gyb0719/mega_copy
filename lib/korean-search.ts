'use client';

// ========================================
// 한국어 검색 클라이언트 유틸리티
// ========================================

import { useState, useEffect } from 'react'
import { supabase } from './supabase-rpc-api'

/**
 * 한국어 검색 API
 */
export const koreanSearchAPI = {
  /**
   * 상품 검색 (한국어 최적화)
   */
  async searchProducts(query: string, limit = 50, offset = 0) {
    if (!query || query.trim().length === 0) {
      // 검색어가 없으면 전체 상품 반환
      const { data, error } = await supabase.rpc('get_products', {
        limit_count: limit,
        offset_count: offset
      })
      
      if (error) throw error
      return data
    }

    // 한국어 검색 함수 호출
    const { data, error } = await supabase.rpc('search_products_korean', {
      search_query: query.trim(),
      limit_count: limit,
      offset_count: offset
    })

    if (error) throw error
    
    // 검색어 기록 (비동기로 처리)
    this.logSearchTerm(query).catch(console.error)
    
    return data
  },

  /**
   * 자동완성 검색
   */
  async getAutocomplete(prefix: string, limit = 10) {
    if (!prefix || prefix.length < 1) return { suggestions: [] }

    const { data, error } = await supabase.rpc('search_autocomplete', {
      prefix: prefix.trim(),
      limit_count: limit
    })

    if (error) throw error
    return data
  },

  /**
   * 인기 검색어 조회
   */
  async getPopularSearches(limit = 10) {
    const { data, error } = await supabase.rpc('get_popular_searches', {
      limit_count: limit
    })

    if (error) throw error
    return data
  },

  /**
   * 검색어 기록
   */
  async logSearchTerm(term: string) {
    if (!term || term.trim().length === 0) return

    const { error } = await supabase.rpc('log_search_term', {
      term: term.trim()
    })

    if (error) console.error('Failed to log search term:', error)
  },

  /**
   * 한글 초성 검색 지원 (클라이언트 사이드)
   */
  getChoseong(str: string): string {
    const cho = ['ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ','ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ']
    let result = ''
    
    for(let i = 0; i < str.length; i++) {
      const code = str.charCodeAt(i) - 44032
      if(code > -1 && code < 11172) {
        result += cho[Math.floor(code / 588)]
      } else {
        result += str.charAt(i)
      }
    }
    
    return result
  },

  /**
   * 검색어 하이라이트 처리
   */
  highlightSearchTerm(text: string, searchTerm: string): string {
    if (!text || !searchTerm) return text
    
    const regex = new RegExp(`(${searchTerm})`, 'gi')
    return text.replace(regex, '<mark class="bg-yellow-200">$1</mark>')
  },

  /**
   * 검색 필터 옵션
   */
  buildSearchFilters(options: {
    query?: string
    category?: string
    minPrice?: number
    maxPrice?: number
    brands?: string[]
    inStock?: boolean
  }) {
    const filters: any = {}
    
    if (options.query) filters.search_query = options.query
    if (options.category) filters.category_filter = options.category
    if (options.minPrice) filters.price_min = options.minPrice
    if (options.maxPrice) filters.price_max = options.maxPrice
    
    return filters
  }
}

/**
 * React Hook: 검색 기능
 */
export function useKoreanSearch() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestions, setSuggestions] = useState<any[]>([])

  const search = async (query: string, options?: any) => {
    setLoading(true)
    setError(null)
    
    try {
      const data = await koreanSearchAPI.searchProducts(
        query,
        options?.limit || 50,
        options?.offset || 0
      )
      setResults(data.data || [])
      return data
    } catch (err: any) {
      setError(err.message)
      setResults([])
      return null
    } finally {
      setLoading(false)
    }
  }

  const getAutocomplete = async (prefix: string) => {
    try {
      const data = await koreanSearchAPI.getAutocomplete(prefix)
      setSuggestions(data.suggestions || [])
      return data.suggestions
    } catch (err) {
      console.error('Autocomplete error:', err)
      setSuggestions([])
      return []
    }
  }

  const clearResults = () => {
    setResults([])
    setSuggestions([])
    setError(null)
  }

  return {
    results,
    suggestions,
    loading,
    error,
    search,
    getAutocomplete,
    clearResults
  }
}

// 검색 디바운스 유틸리티
export function useDebounce(value: string, delay: number) {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// 사용 예제:
/*
import { useKoreanSearch, useDebounce } from '@/lib/korean-search'

function SearchComponent() {
  const [searchTerm, setSearchTerm] = useState('')
  const debouncedSearch = useDebounce(searchTerm, 300)
  const { results, suggestions, loading, search, getAutocomplete } = useKoreanSearch()

  useEffect(() => {
    if (debouncedSearch) {
      search(debouncedSearch)
      getAutocomplete(debouncedSearch)
    }
  }, [debouncedSearch])

  return (
    <div>
      <input
        type="text"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        placeholder="상품 검색..."
      />
      
      {suggestions.length > 0 && (
        <ul className="autocomplete">
          {suggestions.map((s, i) => (
            <li key={i} onClick={() => setSearchTerm(s.value)}>
              {s.value} <span className="text-sm">({s.type})</span>
            </li>
          ))}
        </ul>
      )}
      
      {loading && <div>검색 중...</div>}
      
      {results.map(product => (
        <div key={product.id}>
          {product.name} - {product.price}원
        </div>
      ))}
    </div>
  )
}
*/