#!/bin/sh
# Native build guard; production IDs are supplied through an untracked xcconfig.
set -eu
ads_environment=disabled
ads_approved=false
banner_id=
task_ifs=$IFS
IFS=,
for encoded in ${DART_DEFINES:-}; do
  IFS=$task_ifs
  decoded=$(printf '%s' "$encoded" | base64 --decode 2>/dev/null || printf '%s' "$encoded" | base64 -D)
  case "$decoded" in
    PAINTME_ADS=*) ads_environment=${decoded#*=} ;;
    PAINTME_ADS_APPROVED=*) ads_approved=${decoded#*=} ;;
    ADMOB_BANNER_ID=*) banner_id=${decoded#*=} ;;
  esac
  IFS=,
done
IFS=$task_ifs
case "$ads_environment" in
  disabled) exit 0 ;;
  test)
    case ${CONFIGURATION:-Release} in Debug*) exit 0 ;; *) echo 'Test advertising is forbidden in release/profile.' >&2; exit 1 ;; esac ;;
  production)
    [ "$ads_approved" = true ] || { echo 'Production advertising requires approval.' >&2; exit 1; }
    printf '%s' "${ADMOB_APP_ID:-}" | grep -Eq '^ca-app-pub-[0-9]{16}~[0-9]{10}$' || { echo 'Missing production App ID.' >&2; exit 1; }
    printf '%s' "$banner_id" | grep -Eq '^ca-app-pub-[0-9]{16}/[0-9]{10}$' || { echo 'Missing production banner ID.' >&2; exit 1; }
    case "$ADMOB_APP_ID $banner_id" in *ca-app-pub-3940256099942544*) echo 'Sample IDs are forbidden in production.' >&2; exit 1 ;; esac ;;
  *) echo 'Unknown advertising environment.' >&2; exit 1 ;;
esac
