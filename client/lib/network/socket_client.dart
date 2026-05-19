import 'dart:convert';

import 'package:web_socket_channel/web_socket_channel.dart';

class SocketClient {
  SocketClient(this.serverWsUrl);

  final String serverWsUrl;
  WebSocketChannel? _channel;

  Stream<Map<String, dynamic>> connect() {
    _channel = WebSocketChannel.connect(Uri.parse(serverWsUrl));
    return _channel!.stream
        .map((event) => jsonDecode(event as String) as Map<String, dynamic>);
  }

  void sendTerminalCommand(String command) {
    _channel?.sink.add(
      jsonEncode({
        'type': 'terminal.command',
        'payload': {'command': command},
      }),
    );
  }

  void dispose() {
    _channel?.sink.close();
  }
}
