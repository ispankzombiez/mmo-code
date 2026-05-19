import 'package:flutter/material.dart';

import 'network/socket_client.dart';

void main() {
  runApp(const MmoHackApp());
}

class MmoHackApp extends StatelessWidget {
  const MmoHackApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'MMO Hack Client',
      theme: ThemeData.dark(),
      home: const TerminalHomePage(),
    );
  }
}

class TerminalHomePage extends StatefulWidget {
  const TerminalHomePage({super.key});

  @override
  State<TerminalHomePage> createState() => _TerminalHomePageState();
}

class _TerminalHomePageState extends State<TerminalHomePage> {
  final _controller = TextEditingController();
  final _messages = <String>[];
  late final SocketClient _socket;

  @override
  void initState() {
    super.initState();
    _socket = SocketClient('ws://localhost:8080/ws');
    _socket.connect().listen((event) {
      setState(() {
        _messages.add(event.toString());
      });
    });
  }

  @override
  void dispose() {
    _socket.dispose();
    _controller.dispose();
    super.dispose();
  }

  void _send() {
    final command = _controller.text.trim();
    if (command.isEmpty) return;
    _socket.sendTerminalCommand(command);
    setState(() {
      _messages.add('> $command');
      _controller.clear();
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('MMO Terminal')),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              itemCount: _messages.length,
              itemBuilder: (context, index) => Padding(
                padding: const EdgeInsets.all(8),
                child: Text(_messages[index]),
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(8),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'Type command (example: connect 10.0.0.5)',
                    ),
                    onSubmitted: (_) => _send(),
                  ),
                ),
                IconButton(onPressed: _send, icon: const Icon(Icons.send)),
              ],
            ),
          )
        ],
      ),
    );
  }
}
