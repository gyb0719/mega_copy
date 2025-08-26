class AppConstants {
  // Supabase Configuration
  static const String supabaseUrl = 'YOUR_SUPABASE_URL';
  static const String supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
  
  // App Info
  static const String appName = '빌리지';
  static const String appVersion = '1.0.0';
  
  // API Keys (환경변수로 관리 예정)
  static const String kakaoApiKey = 'YOUR_KAKAO_API_KEY';
  static const String googleApiKey = 'YOUR_GOOGLE_API_KEY';
  static const String portOneApiKey = 'YOUR_PORTONE_API_KEY';
  
  // Default Values
  static const int defaultPageSize = 20;
  static const int maxImageUpload = 10;
  static const int maxImageSize = 5 * 1024 * 1024; // 5MB
  
  // Categories
  static const List<String> categories = [
    '카메라/렌즈',
    '게임 콘솔',
    '노트북/태블릿',
    '드론/액션캠',
    '음향기기',
    '캠핑/레저',
    '기타',
  ];
  
  // Rental Periods
  static const Map<String, int> rentalPeriods = {
    '1일': 1,
    '3일': 3,
    '1주': 7,
    '2주': 14,
    '1개월': 30,
    '3개월': 90,
  };
}