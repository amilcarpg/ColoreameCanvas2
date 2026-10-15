import copy
from pathlib import Path
import sys
import unittest

sys.path.insert(0, str(Path(__file__).resolve().parents[1]/'scripts'))
from configure_firebase import disabled_defines


class FirebaseConfigurationTests(unittest.TestCase):
    def setUp(self):
        self.data = {'project_info': {'project_id': 'paintme1', 'project_number': '278253770765'},
                     'client': [{'client_info': {'mobilesdk_app_id': '1:278253770765:android:86885d699ee2c4175cdd44',
                                                'android_client_info': {'package_name': 'com.focuzlab.paintme'}},
                                 'api_key': [{'current_key': 'AIza'+'x'*35}]}]}

    def test_import_never_enables_collection_or_modifies_source(self):
        original = copy.deepcopy(self.data)
        self.data['PAINTME_ANALYTICS'] = True
        values = disabled_defines(self.data)
        self.assertEqual(values['PAINTME_ANALYTICS'], 'false')
        self.assertEqual(values['PAINTME_ANALYTICS_REVIEWED'], 'false')
        del self.data['PAINTME_ANALYTICS']
        self.assertEqual(self.data, original)

    def test_wrong_or_ambiguous_app_is_rejected(self):
        self.data['client'][0]['client_info']['android_client_info']['package_name'] = 'another.app'
        with self.assertRaises(ValueError):
            disabled_defines(self.data)
        self.setUp()
        self.data['client'].append(copy.deepcopy(self.data['client'][0]))
        with self.assertRaises(ValueError):
            disabled_defines(self.data)

    def test_mixed_project_or_missing_key_is_rejected(self):
        self.data['project_info']['project_number'] = '123456'
        with self.assertRaisesRegex(ValueError, 'different projects'):
            disabled_defines(self.data)
        self.setUp()
        self.data['client'][0]['api_key'] = []
        with self.assertRaises(ValueError):
            disabled_defines(self.data)


if __name__ == '__main__':
    unittest.main()
