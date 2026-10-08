import 'dart:math';
import 'package:flutter/material.dart';

/// Separates adult actions in the interface; this is not legal age/parent verification.
Future<bool> requestAdultAccess(BuildContext context) async =>
    await showDialog<bool>(
      context: context,
      builder: (_) => const AdultGateDialog(),
    ) ??
    false;

class AdultGateDialog extends StatefulWidget {
  const AdultGateDialog({super.key});
  @override
  State<AdultGateDialog> createState() => _AdultGateDialogState();
}

class _AdultGateDialogState extends State<AdultGateDialog> {
  final _answer = TextEditingController();
  late final int _left, _right;
  bool _error = false;
  @override
  void initState() {
    super.initState();
    final random = Random.secure();
    _left = 17 + random.nextInt(33);
    _right = 3 + random.nextInt(6);
  }

  void _submit() {
    if (int.tryParse(_answer.text.trim()) == _left * _right) {
      Navigator.pop(context, true);
    } else {
      setState(() => _error = true);
    }
  }

  @override
  void dispose() {
    _answer.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AlertDialog(
    title: const Text('Solo para adultos'),
    content: SingleChildScrollView(
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Para continuar, resuelve: $_left × $_right'),
          TextField(
            controller: _answer,
            autofocus: true,
            keyboardType: TextInputType.number,
            decoration: InputDecoration(
              labelText: 'Respuesta',
              errorText: _error ? 'Revisa la respuesta.' : null,
            ),
            onSubmitted: (_) => _submit(),
          ),
        ],
      ),
    ),
    actions: [
      TextButton(
        onPressed: () => Navigator.pop(context, false),
        child: const Text('Cancelar'),
      ),
      FilledButton(onPressed: _submit, child: const Text('Continuar')),
    ],
  );
}
