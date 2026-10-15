"""Import the confirmed Android Firebase client as disabled local Dart defines."""
from pathlib import Path
import argparse
import hashlib
import json
import re

ROOT = Path(__file__).resolve().parents[1]
PACKAGE = 'com.focuzlab.paintme'


def disabled_defines(data):
    clients = [client for client in data.get('client', [])
               if client.get('client_info', {}).get('android_client_info', {}).get('package_name') == PACKAGE]
    if len(clients) != 1:
        raise ValueError('Expected exactly one Firebase client for ' + PACKAGE)
    client = clients[0]
    project = data.get('project_info', {})
    keys = client.get('api_key', [])
    if len(keys) != 1:
        raise ValueError('Expected exactly one client API key')
    values = {
        'PAINTME_ANALYTICS': 'false', 'PAINTME_ANALYTICS_REVIEWED': 'false',
        'FIREBASE_API_KEY': keys[0].get('current_key', ''),
        'FIREBASE_APP_ID': client.get('client_info', {}).get('mobilesdk_app_id', ''),
        'FIREBASE_PROJECT_ID': project.get('project_id', ''),
        'FIREBASE_MESSAGING_SENDER_ID': project.get('project_number', ''),
    }
    rules = {
        'FIREBASE_API_KEY': r'AIza[A-Za-z0-9_-]{35}',
        'FIREBASE_APP_ID': r'1:[0-9]+:android:[a-f0-9]+',
        'FIREBASE_PROJECT_ID': r'[a-z][a-z0-9-]{4,28}[a-z0-9]',
        'FIREBASE_MESSAGING_SENDER_ID': r'[0-9]+',
    }
    for field, pattern in rules.items():
        if not isinstance(values[field], str) or not re.fullmatch(pattern, values[field]):
            raise ValueError('Invalid Firebase field: ' + field)
    if values['FIREBASE_APP_ID'].split(':')[1] != values['FIREBASE_MESSAGING_SENDER_ID']:
        raise ValueError('Firebase app and sender belong to different projects')
    return values


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--source', type=Path, required=True)
    parser.add_argument('--write', action='store_true')
    args = parser.parse_args()
    source = args.source.read_bytes()
    values = disabled_defines(json.loads(source.decode('utf-8-sig')))
    destination = ROOT/'flutter/firebase-config.local.json'
    if args.write:
        destination.write_text(json.dumps(values, indent=2)+'\n', encoding='utf-8')
    print(json.dumps({'written': args.write, 'destination': 'flutter/firebase-config.local.json',
                      'source_sha256': hashlib.sha256(source).hexdigest(),
                      'package': PACKAGE, 'project': values['FIREBASE_PROJECT_ID'],
                      'app_id': values['FIREBASE_APP_ID'], 'analytics_enabled': False,
                      'treatment_reviewed': False, 'api_key': '[not printed]'}))


if __name__ == '__main__':
    main()
