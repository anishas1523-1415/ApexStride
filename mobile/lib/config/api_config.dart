import 'package:flutter_dotenv/flutter_dotenv.dart';

class ApiConfig {
  static String get baseUrl {
    return dotenv.env['API_URL'] ?? 'http://10.0.2.2:8000/api/v1';
  }
}
