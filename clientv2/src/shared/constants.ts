export enum API {
  URL = 'https://192.168.1.82',
}

/**
 * Browser Window unique identifier names.
 *
 * @enum
 */
export enum WindowIdentifier {
  Main = 'main_window',
  Dashboard = 'dashboard_window',
  Down = 'down_window',
  Maintainance = 'maintainance_window',
  Setup = 'setup_window',
  Settings = 'settings_window',
  SomethingWentWrong = 'sww_window',
  Logout = 'logout_window',
  Splash = 'splash_window',
}

/**
 * IPC listener route names.
 *
 * @enum
 */
export enum IPCRoute {
  APP_INFO = '/application/info',
  DATABASE_CHECK_CONNECTION = '/database/check_connection',
  DATABASE_GET_LABS = '/database/get_labs',
  DATABASE_REGISTER_DEVICE = '/database/register_device',
  DATABASE_GET_NETWORK_NAMES = '/database/get_network_names',
  DATABASE_GET_DEVICE = '/database/get_device',
  DATABASE_GET_DEVICE_BY_MAC = '/database/get_device_by_mac',
  DATABASE_GET_DEVICE_BY_ID = '/database/get_device_by_id',
  DATABASE_GET_ACTIVE_USER_BY_DEVICE_ID_AND_LAB_ID = '/database/get_active_user_by_device_id_and_lab_id',
  DATABASE_GET_DEVICE_USER_BY_ACTIVE_USER_ID = '/database/get_device_user_by_active_user_id',
  DATABASE_GET_USER_RECENT_LOGIN_BY_USER_ID = '/database/get_user_recent_login_by_user_id',
  DATABASE_GET_ALL_DEVICE_USERS_BY_LAB_ID = '/database/get_all_device_users_by_lab_id',
  DATABASE_GET_ALL_ACTIVE_DEVICE_USERS_BY_LAB_ID = '/database/get_all_active_device_users_by_lab_id',
  DATABASE_GET_SUBJECT_RECORDS_BY_SUBJECT_ID = '/database/get_subject_records_by_subject_id',
  DATABASE_GET_ACTIVE_USERS_BY_SUBJECT_ID = '/database/get_active_users_by_subject_id',
  DATABASE_GET_SUBJECTS_BY_LAB_ID = '/database/get_subjects_by_lab_id',
  DATABASE_GET_SUBJECT_BY_ID = '/database/get_subject_by_id',
  DATABASE_GET_STUDENT_SUBJECTS = '/database/get_student_subjects',
  DATABASE_GET_SUBJECT_DATA = '/database/get_subject_data',
  DATABASE_JOIN_SUBJECT = '/database/join_subject',
  DATABASE_DELETE_SUBJECT = '/database/delete_subject',
  DATABASE_USER_LOGOUT = '/database/user_logout',
  DATABASE_CREATE_SUBJECT = '/database/create_subject',
  UPDATER_CHECKING = '/updater/checking',
  UPDATER_DOWNLOADING = '/updater/downloading',
  UPDATER_FINISHED = '/updater/finished',
  UPDATER_INSTALL = '/updater/install',
  UPDATER_NO_UPDATE = '/updater/noUpdate',
  UPDATER_START = '/updater/start',
  WINDOW_CLOSE = '/window/close',
  WINDOW_SEND = '/window/send',
  WINDOW_OPEN = '/window/open',
  WINDOW_HIDE = '/window/hide',
}