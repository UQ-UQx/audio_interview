<?php

class MyApi
{
  /**
   * Object containing all incoming request params
   * @var object
   */
  private $request;
  private $db;
  private $config;
  private $jwt_decoded;

  public function __construct($database, $config)
  {
    $this->db = $database;
    $this->config = $config;
    $this->_processRequest();
  }

  /**
   * Routes incoming requests to the corresponding method
   *
   * Converts $_REQUEST to an object, then checks for the given action and
   * calls that method. All the request parameters are stored under
   * $this->request.
   */
  private function _processRequest()
  {
    // get the request
    if (!empty($_REQUEST)) {
      // convert to object for consistency
      $this->request = json_decode(json_encode($_REQUEST));
    } else {
      // already object
      $this->request = json_decode(file_get_contents('php://input'));
    }

    // prevent unauthenticated access to API
    $this->_secureBackend();

    //check if an action is sent through
    if (!isset($this->request->action)) {
      //if no action is provided then reply with a 400 error with message
      $this->reply("No Action Provided", 400);
      //kill script
      exit();
    }

    //check if method for the action exists
    if (!method_exists($this, $this->request->action)) {
      //if method doesn't exist, send 400 code and message with reply'
      $this->reply("Action method not found", 400);
      //kill script
      exit();
    }

    switch ($this->request->action) {
      case "hello":
        $this->hello($this->request->data);
        break;
      case "uploadFile":
        $this->uploadFile();
      case "uploadStudentData":
        $this->uploadStudentData($this->request);
      case "getSubmissions":
        $this->getSubmissions($this->request->data);
      default:
        $this->reply("action switch failed", 400);
        break;
    }
  }

  private function parseStudentDataCSV($courseID)
  {
    $anonPath = "../media/recordings/" . $courseID . "/anon.csv";

    $profilePath = "../media/recordings/" . $courseID . "/profile.csv";

    $anonParsed = [];
    $profileParsed = [];

    if (file_exists($anonPath) && file_exists($profilePath)) {
      $anonParsed = $this->loadCSV($anonPath);

      $profileParsed = $this->loadCSV($profilePath);
    }

    return ["anon" => $anonParsed, "profile" => $profileParsed];
  }

  private function mapStudentData($parsed)
  {
    $data = json_decode($this->request->data);

    $courseID = $data->courseID;

    $ltiID = $data->ltiID;

    $anon = $parsed["anon"];
    $profile = $parsed["profile"];

    $anonMapped = [];

    foreach ($anon as $value) {
      $anonMapped[$value["User ID"]] = $value[
        "Course Specific Anonymized User ID"
      ];
    }

    $mappedData = [];
    foreach ($profile as $profile) {
      if (array_key_exists($profile["id"], $anonMapped)) {
        $valuesToGet = [
          1 => 'username',
          2 => 'name',
          3 => 'enrollment_mode',
          4 => 'varification_status',
          5 => 'email'
        ];
        $mappedData[$anonMapped[$profile["id"]]] = [
          "username" => $profile["username"],
          "name" => $profile["name"],
          "enrollment_mode" => $profile["enrollment_mode"],
          "verification_status" => $profile["verification_status"],
          "email" => $profile["email"]
        ];
      }
    }

    return $mappedData;
  }

  public function uploadStudentData($request)
  {
    //$request = json_decode($request);

    $courseID = $request->courseID;
    $ltiID = $request->ltiID;

    // error_log(json_encode($_FILES, JSON_PRETTY_PRINT));

    $anonPath = "../media/recordings/" . $courseID . "/anon.csv";
    $profilePath = "../media/recordings/" . $courseID . "/profile.csv";
    move_uploaded_file($_FILES["file"]["tmp_name"]["anon"], $anonPath);
    move_uploaded_file($_FILES["file"]["tmp_name"]["profile"], $profilePath);

    // $anonParsed = array_map('str_getcsv', file($anonPath));
    // $profileParsed = array_map('str_getcsv', file($profilePath));

    $parsed = $this->parseStudentDataCSV($courseID);
    $mapped = $this->mapStudentData($parsed);

    $this->reply($mapped);
  }

  private function getDirectories(string $path): array
  {
    $directories = [];
    $items = scandir($path);
    foreach ($items as $item) {
      if ($item == '..' || $item == '.') {
        continue;
      }
      if (is_dir($path . '/' . $item)) {
        $directories[] = $item;
      }
    }
    return $directories;
  }

  public function getSubmissions($data)
  {
    $data = json_decode($data);

    $courseID = $data->courseID;

    $ltiID = $data->ltiID;

    $path = '../media/recordings/' . $courseID . '/' . $ltiID . '/';

    $dirs = $this->getDirectories($path); // glob('../media/recordings/'.$courseID.'/'.$ltiID.'/*', GLOB_ONLYDIR);
    $submissions = array();
    foreach ($dirs as $user) {
      $scanned_items = scandir($path . '/' . $user);

      $submissions[$user] = $scanned_items;
    }

    $parsed = $this->parseStudentDataCSV($courseID);
    $mapped = $this->mapStudentData($parsed);

    $metaData = [];
    $select = $this->db->query(
      'SELECT * FROM questions_list WHERE resource_id = :resource_id AND course_id = :course_id',
      array('resource_id' => $ltiID, 'course_id' => $courseID)
    );
    while ($row = $select->fetch()) {
      $meta = $row;
      if ($meta->completed) {
        $metaData[$meta->user_id] = [
          "questions" => $meta->questions,
          "submitted" => $meta->updated
        ];
      }
    }

    $this->reply([
      "submissions" => $submissions,
      "mapped_data" => $mapped,
      "meta_data" => $metaData
    ]);
  }

  public function uploadFile()
  {
    $old_umask = umask(0);
    try {
      $userID = $_POST['userID'];
      $ltiID = $_POST['ltiID'];
      $courseID = $_POST['courseID'];
      $audio = $_POST['audio'];
      // $video = $_POST['video'];
      $images = json_decode($_POST['images']);

      $mediaDir = "../media";
      $recordingsDir = $mediaDir . "/recordings";
      $courseDir = $recordingsDir . "/" . $courseID;
      $ltiDir = $courseDir . "/" . $ltiID;
      $userDir = $ltiDir . "/" . $userID;

      if (!is_dir($mediaDir)) {
        $res = mkdir($mediaDir, 0777);
      }

      if (!is_dir($recordingsDir)) {
        $res = mkdir($recordingsDir, 0777);
      }

      if (!is_dir($courseDir)) {
        $res = mkdir($courseDir, 0777);
      }

      if (!is_dir($ltiDir)) {
        $res = mkdir($ltiDir, 0777);
      }

      if (!is_dir($userDir)) {
        $res = mkdir($userDir, 0777);
      }

      error_log(is_dir($userDir));

      // pull the raw binary data from the POST array
      $audioData = substr($audio, strpos($audio, ",") + 1);
      // $videoData = substr($video, strpos($video, ",") + 1);

      // decode it
      $decodedAudioData = base64_decode($audioData);
      // $decodedVideoData = base64_decode($videoData);

      // print out the raw data,
      $audioFilename = 'audio_recording_' . $userID . '.webm';
      // $videoFilename = 'video_recording_' . $userID . '.webm';

      // write the data out to the file
      $fp = fopen($userDir . '/' . $audioFilename, 'wb');

      // Split the data if it is too large.
      // Check the size
      //$sizeDecodedAudioData = strlen($decodedAudioData);
      $pieces = str_split($decodedAudioData, 1024 * 4);
      foreach ($pieces as $piece) {
        fwrite($fp, $piece, strlen($piece));
      }
      fclose($fp);
      //      fwrite($fp, $decodedAudioData);
      //      fclose($fp);

      // $fp = fopen($userDir . '/' . $videoFilename, 'wb');
      // fwrite($fp, $decodedVideoData);
      // fclose($fp);

      $filenames = array();
      foreach ($images as $key => $image) {
        //error_log(json_encode($image));
        $filename = 'time-' . $image->timestamp . '-time' . $image->filename;

        $data = $image->data;
        list($type, $data) = explode(';', $data);
        list(, $data) = explode(',', $data);
        $data = base64_decode($data);

        error_log($data);

        file_put_contents(
          $userDir . '/' . $userID . '_' . $filename . ".png",
          $data
        );

        // $fp = fopen($userDir . '/' . $userID . '_' . $filename, 'wb');
        // fwrite($fp, base64_decode($image->data));
        // fclose($fp);

        array_push($filenames, $filename . ".png");
      }

      $this->reply(array(
        'audioFilename' => $audioFilename,
        'filenames' => $filenames
        // 'videoFilename' => $videoFilename
      ));
    } catch (Exception $e) {
      $this->reply($e, 400);
    } finally {
      umask($old_umask);
    }
  }

  private function fwrite_stream($fp, $string)
  {
    for ($written = 0; $written < strlen($string); $written += $fwrite) {
      $fwrite = fwrite($fp, substr($string, $written));
      if ($fwrite === false) {
        return $written;
      }
    }
    return $written;
  }

  public function hello()
  {
    $data = json_decode($this->request->data);

    $url = "../media/new.webm";
    $audio = file_get_contents($url);

    //$newData = "data:audio/webm;base64,".base64_encode($audio);

    file_put_contents('../media/newb.webm', $audio);
    $newData = base64_decode($audio);

    $fp = fopen("../media/newData.webm", 'wb');
    fwrite($fp, $audio);
    fclose($fp);

    $this->reply($newData);
  }

  /**
   * Prevent unauthenticated access to the backend
   */
  private function _secureBackend()
  {
    if (!$this->_isAuthenticated()) {
      header("HTTP/1.1 401 Unauthorized");
      exit();
    }
  }

  /**
   * Check if user is authenticated
   *
   * This is just a placeholder. Here you would check the session or similar
   * to see if the user is logged in and/or authorized to make API calls.
   */
  private function _isAuthenticated()
  {
    try {
      $jwt_decoded = JWT::decode(
        $this->request->jwt_token,
        $this->config['jwt_key']
      );
      $this->jwt_decoded = $jwt_decoded;
      return true;
    } catch (UnexpectedValueException $e) {
      $this->lti_jwt = false;
      error_log('UnexpectedValueException: ' . $e->getMessage());
      return false;
    }
  }

  /**
   * Returns JSON data with HTTP status code
   *
   * @param  array $data - data to return
   * @param  int $status - HTTP status code
   * @return JSON
   */
  private function reply($data, $status = 200)
  {
    $protocol = (isset($_SERVER['SERVER_PROTOCOL'])
      ? $_SERVER['SERVER_PROTOCOL']
      : 'HTTP/1.1');
    header($protocol . ' ' . $status);
    header('Content-Type: application/json');
    echo json_encode($data);
    exit();
  }

  /**
   * Determines if the logged in user has admin rights
   *
   * This is just a placeholder. Here you would check the session or database
   * to see if the user has admin rights.
   *
   * @return boolean
   */
  public function isAdmin()
  {
    $this->reply(true);
  }

  private function loadCSV($file)
  {
    // Create an array to hold the data
    $arrData = array();

    // Create a variable to hold the header information
    $header = null;

    // Connect to the database
    //$db = mysqli_connect('localhost','username','password','test') or die("Failed to connect to MySQL: " . mysqli_connect_error());

    // If the file can be opened as readable, bind a named resource
    if (($handle = fopen($file, 'r')) !== false) {
      // Loop through each row
      while (($row = fgetcsv($handle)) !== false) {
        // Loop through each field
        foreach ($row as &$field) {
          // Remove any invalid or hidden characters
          $field = preg_replace('/[\x00-\x1F\x80-\xFF]/', '', $field);

          // Escape characters for MySQL (single quotes, double quotes, linefeeds, etc.)
          //$field = mysqli_escape_string($db, $field);
        }

        // If the header has been stored
        if ($header) {
          // Create an associative array with the data
          $arrData[] = array_combine($header, $row);
        } else {
          // Else the header has not been stored
          // Store the current row as the header
          $header = $row;
        }
      }

      // Close the file pointer
      fclose($handle);
    }

    // Close the MySQL connection
    //mysqli_close($db);

    return $arrData;
  }
} //MyApi class end

require_once '../lib/db.php';
require_once '../config.php';
require_once '../lib/jwt.php';

if (isset($config['use_db']) && $config['use_db']) {
  Db::config('driver', 'mysql');
  Db::config('host', $config['db']['hostname']);
  Db::config('database', $config['db']['database']);
  Db::config('user', $config['db']['username']);
  Db::config('password', $config['db']['password']);
}

$db = Db::instance(); //uncomment and enter db details in config to use database
$MyApi = new MyApi($db, $config);
