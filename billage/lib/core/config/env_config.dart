import 'package:flutter_dotenv/flutter_dotenv.dart';

class EnvConfig {
  // Supabase
  static String get supabaseUrl => 
      dotenv.env['SUPABASE_URL'] ?? 'https://placeholder.supabase.co';
  static String get supabaseAnonKey => 
      dotenv.env['SUPABASE_ANON_KEY'] ?? 'placeholder_key';
  
  // OAuth Keys  
  static String get kakaoApiKey => 
      dotenv.env['KAKAO_API_KEY'] ?? '';
  static String get googleClientId => 
      dotenv.env['GOOGLE_CLIENT_ID'] ?? '';
  
  // Map Services
  static String get googleMapsApiKey => 
      dotenv.env['GOOGLE_MAPS_API_KEY'] ?? '';
  static String get kakaoMapApiKey => 
      dotenv.env['KAKAO_MAP_API_KEY'] ?? '';
  
  // Payment Gateway
  static String get portOneUserCode => 
      dotenv.env['PORTONE_USER_CODE'] ?? '';
  
  // App Configuration
  static String get appEnv => 
      dotenv.env['APP_ENV'] ?? 'development';
  static bool get isDebug => 
      dotenv.env['APP_DEBUG'] == 'true';
  
  // Initialize dotenv
  static Future<void> init() async {
    try {
      await dotenv.load(fileName: '.env');
    } catch (e) {
      // .env 파일이 없을 경우 기본값 사용
      print('Warning: .env file not found, using default values');
    }
  }
}