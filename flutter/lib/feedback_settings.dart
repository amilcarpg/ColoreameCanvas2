import 'package:flutter/services.dart';
import 'package:shared_preferences/shared_preferences.dart';

class FeedbackSettings {
  static const _key = 'paintme_haptics_enabled';
  bool enabled = true;

  Future<void> load() async =>
      enabled = (await SharedPreferences.getInstance()).getBool(_key) ?? true;
  Future<void> setEnabled(bool value) async {
    enabled = value;
    await (await SharedPreferences.getInstance()).setBool(_key, value);
  }

  void selection() {
    if (enabled) HapticFeedback.selectionClick();
  }

  void success() {
    if (enabled) HapticFeedback.lightImpact();
  }
}
