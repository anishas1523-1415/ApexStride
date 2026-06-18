import 'package:dio/dio.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'api_config.dart';

class ApiService {
  static final ApiService _instance = ApiService._internal();
  late Dio dio;
  final storage = const FlutterSecureStorage();

  factory ApiService() {
    return _instance;
  }

  ApiService._internal() {
    dio = Dio(BaseOptions(
      baseUrl: ApiConfig.baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 10),
    ));

    dio.interceptors.add(
      InterceptorsWrapper(
        onRequest: (options, handler) async {
          // Add access token to header
          String? accessToken = await storage.read(key: 'access_token');
          if (accessToken != null) {
            options.headers['Authorization'] = 'Bearer $accessToken';
          }
          return handler.next(options);
        },
        onError: (DioException e, handler) async {
          if (e.type == DioExceptionType.connectionTimeout || 
              e.type == DioExceptionType.receiveTimeout) {
            // Modify the error to have a friendly message for the UI to display in a Snackbar
            return handler.next(DioException(
              requestOptions: e.requestOptions,
              error: 'Connection timeout. Please check your internet connection.',
              type: e.type,
            ));
          }
          
          if (e.response?.statusCode == 401) {
            // Attempt to refresh token
            String? refreshToken = await storage.read(key: 'refresh_token');
            if (refreshToken != null) {
              try {
                // Use a separate Dio instance to avoid interceptor loops
                Dio refreshDio = Dio();
                var response = await refreshDio.post(
                  '${ApiConfig.baseUrl}/auth/refresh',
                  data: {'refresh_token': refreshToken},
                );

                if (response.statusCode == 200) {
                  String newAccessToken = response.data['access_token'];
                  String newRefreshToken = response.data['refresh_token'];
                  
                  await storage.write(key: 'access_token', value: newAccessToken);
                  await storage.write(key: 'refresh_token', value: newRefreshToken);

                  // Retry the original request with the new token
                  e.requestOptions.headers['Authorization'] = 'Bearer $newAccessToken';
                  
                  // Create a new request using the original options
                  final opts = Options(
                    method: e.requestOptions.method,
                    headers: e.requestOptions.headers,
                  );
                  
                  final retryResponse = await dio.request(
                    e.requestOptions.path,
                    options: opts,
                    data: e.requestOptions.data,
                    queryParameters: e.requestOptions.queryParameters,
                  );
                  
                  return handler.resolve(retryResponse);
                }
              } catch (refreshError) {
                // Refresh failed, user must login again
                await storage.delete(key: 'access_token');
                await storage.delete(key: 'refresh_token');
                // Optional: Trigger global event to push to LoginScreen
              }
            }
          }
          return handler.next(e);
        },
      ),
    );
  }
}
