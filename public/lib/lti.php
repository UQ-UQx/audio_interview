<?php

require_once('config.php');
require_once('OAuth.php');

class Lti {

    // set to FALSE on production

	protected $testing = true;
	protected $config = array();

	protected $ltivars = array();
	protected $valid = false;
	protected $errors = '';

	function __construct($config, $display_errors=false) {
		if($display_errors) {
			$this->display_errors();
		}

		$this->config = $config;
		if(!empty($_POST)) {
			$this->ltivars = $_POST;
		}
        if($this->testing) {
        	if(!isset($this->ltivars["oauth_consumer_key"])) {
        		$this->valid = true;
				$this->usedummydata();
        	}
        }
        if(!$this->testing || isset($this->ltivars["oauth_consumer_key"])){
        	$store = new TrivialOAuthDataStore();
        	if(!isset($this->ltivars["oauth_consumer_key"])) {
        		$this->ltivars["oauth_consumer_key"] = '';
        	}
        	if(isset($this->config['lti_keys'][$this->ltivars["oauth_consumer_key"]])) {
	        	$lti_key = $this->config['lti_keys'][$this->ltivars["oauth_consumer_key"]];
				$store->add_consumer($this->ltivars["oauth_consumer_key"], $lti_key);
				$server = new OAuthServer($store);
				$method = new OAuthSignatureMethod_HMAC_SHA1();
				$server->add_signature_method($method);
				$request = OAuthRequest::from_request(NULL,NULL,NULL,$this->ltivars);
				$this->basestring = $request->get_signature_base_string();
				try {
    	        	$server->verify_request($request);
					$this->valid = true;
				} catch (Exception $e) {
					$this->errors = 'Bad LTi Validation (possible incorrect secret) - '.$e->getMessage();
				}
			} else {
				$this->errors = 'Invalid consumer key';
			}
		}
	}



	function setltivars($vars) {
		$this->ltivars = $vars;
	}

	function resource_id(){

		if(isset($this->ltivars["resource_link_id"])) {
			return $this->ltivars["resource_link_id"];
		}
		return 'Unknown resource_link_id';

	}

	function display_errors() {
		ini_set('display_errors',1);
		ini_set('display_startup_errors',1);
		error_reporting(-1);
	}

	function get_errors() {
		return $this->errors;
	}

	function is_dev(){
		if($this->testing){
			return true;
		}
		return false;
	}

	function is_valid() {
		return $this->valid;
	}

	function user_id() {
		if(isset($this->ltivars['user_id'])) {
			return $this->ltivars['user_id'];
		}
		return 'Unknown user';
	}

	function user_roles() {
		if(isset($this->ltivars['roles'])) {
			return $this->ltivars['roles'];
		}
		return 'Unknown roles';
	}

	function grade_url(){
		if(isset($this->ltivars["lis_outcome_service_url"])) {
			return $this->ltivars["lis_outcome_service_url"];
		}
		return 'No Grade URL';

	}

	function result_sourcedid(){
		if(isset($this->ltivars["lis_result_sourcedid"])) {
			return $this->ltivars["lis_result_sourcedid"];
		}
		return 'No Result SourcedID';

	}

	function lti_id() {
		if(isset($this->ltivars["resource_link_id"])) {
			return $this->ltivars["resource_link_id"];
		}
		return 'Unknown resource link id (lti id)';
	}

	function requirevalid() {
		if($this->valid) {
			return;
		} else {
			echo $this->errors;
			die();
		}
	}

	function calldata() {
		return $this->ltivars;
	}

	function course_id() {
		if(isset($this->ltivars["context_id"])) {
			return $this->ltivars["context_id"];
		}
		return 'Unknown context id (course id)';
	}

	function lti_consumer_key(){
		if(isset($this->ltivars["oauth_consumer_key"])) {
			return $this->ltivars["oauth_consumer_key"];
		}
		return 'Unknown oauth consumer key';
	}


	function usedummydata() {
		$this->ltivars = array(

			'custom_component_display_name' => 'LTI Consumer',
			'lti_version' => 'LTI-1p0',
			'oauth_nonce' => '106095563246583917761495495665',
			'resource_link_id' => 'courses.edx.org-aa766098b5a94a738b54e89caf3a8972_4_5',
			'context_id' => 'course-v1:UQx+COURSECODE_4x+2T2017',
			'oauth_signature_method' => 'HMAC-SHA1',
			'oauth_version' => '1.0',
			'oauth_signature' => 'iFUDZD4AYMhKKgHLf/LeXpNZcSA=',
			'lti_message_type' => 'basic-lti-launch-request',
			'launch_presentation_return_url' => '',
			'user_id' => 'd770caedc6d860f087297810891526d7_4_u30',
			'roles' => 'Instructor',
			//'roles' => 'Student',
			'oauth_consumer_key' => 'uqx',
			'lis_result_sourcedid' => 'course-v1%3AUQx%2BCOURSECODEx%2B2T2017:courses.edx.org-aa766098b5a94a738b54e89caf3a8973:f770caedc6d860f087297810891526d7',
			'launch_presentation_locale' => 'en',
			'oauth_timestamp' => '1495495665',
			'oauth_callback' => 'about:blank',
			'custom_variable_by_user_bool'=>'true',
			'custom_variable_by_user_string'=>"woo hoo i have LTI support"
			
		);
	}

}

/**
 * A Trivial memory-based store - no support for tokens
 */
class TrivialOAuthDataStore extends OAuthDataStore {
    private $consumers = array();

    function add_consumer($consumer_key, $consumer_secret) {
        $this->consumers[$consumer_key] = $consumer_secret;
    }

    function lookup_consumer($consumer_key) {
        if ( strpos($consumer_key, "http://" ) === 0 ) {
            $consumer = new OAuthConsumer($consumer_key,"secret", NULL);
            return $consumer;
        }
        if ( $this->consumers[$consumer_key] ) {
            $consumer = new OAuthConsumer($consumer_key,$this->consumers[$consumer_key], NULL);
            return $consumer;
        }
        return NULL;
    }

    function lookup_token($consumer, $token_type, $token) {
        return new OAuthToken($consumer, "");
    }

    // Return NULL if the nonce has not been used
    // Return $nonce if the nonce was previously used
    function lookup_nonce($consumer, $token, $nonce, $timestamp) {
        // Should add some clever logic to keep nonces from
        // being reused - for no we are really trusting
	// that the timestamp will save us
        return NULL;
    }

    function new_request_token($consumer) {
        return NULL;
    }

    function new_access_token($token, $consumer) {
        return NULL;
    }
}

?>