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
            default:
                $this->reply("action switch failed", 400);
                break;
        }
    }

    public function uploadFile()
    {
        try {
            $userID = $_POST['userID'];
            $ltiID = $_POST['ltiID'];

            $audio = $_POST['audio'];
            // $video = $_POST['video'];
            $images = json_decode($_POST['images']);

            $mediaDir = "../media";
            $recordingsDir = $mediaDir . "/recordings";
            $ltiDir = $recordingsDir . "/" . $ltiID;
            $userDir = $ltiDir . "/" . $userID;

            if (!is_dir($mediaDir)) {
                $res = mkdir($mediaDir, 0777);
            }

            if (!is_dir($recordingsDir)) {
                $res = mkdir($recordingsDir, 0777);
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
            fwrite($fp, $decodedAudioData);
            fclose($fp);

            // $fp = fopen($userDir . '/' . $videoFilename, 'wb');
            // fwrite($fp, $decodedVideoData);
            // fclose($fp);

            $filenames = array();
            foreach ($images as $key => $image) {
                //error_log(json_encode($image));
                $filename =
                    'time-' . $image->timestamp . '-time' . $image->filename;

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

        //error_log(json_encode($response));

        $this->reply("Hello " . $data->name . ", I'm PHP :)");
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
} //MyApi class end

require_once '../lib/db.php';
require_once '../config.php';
require_once '../lib/jwt.php';

// if(isset($config['use_db']) && $config['use_db']) {
// 	Db::config( 'driver',   'mysql' );
// 	Db::config( 'host',     $config['db']['hostname'] );
// 	Db::config( 'database', $config['db']['dbname'] );
// 	Db::config( 'user',     $config['db']['username'] );
// 	Db::config( 'password', $config['db']['password'] );
// }

$db = null; //Db::instance(); //uncomment and enter db details in config to use database
$MyApi = new MyApi($db, $config);
