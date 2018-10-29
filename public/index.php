<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>ReactJS PHP LTI</title>
         <?php
         require_once './config.php';
         require_once './lib/lti.php';
         require_once './lib/jwt.php';

         $lti = new Lti($config, true);
         if (!$lti->is_valid()) {
             echo "LTI Not Valid, Please Contact UQx";
             die();
         }

         $jwt_token = array();
         $jwt_token['lti_vars'] = $lti->calldata();
         // generate encoded token using lti vars signed with the jwt secret
         $jwt_encode_token = JWT::encode($jwt_token, $config['jwt_key']);

         $lti_id = $lti->lti_id();
         $user_id = $lti->user_id();
         $course_id = $lti->course_id();
         $user_roles = $lti->user_roles();

/*

				$calldata = $lti->calldata();
				$lti_grade_url = $lti->grade_url();
				$lti_consumer_key = $lti->lti_consumer_key();
				$result_sourcedid = $lti->result_sourcedid();

			             
				$custom_variable_by_user_string = "woah";
				if(isset($calldata{'custom_variable_by_user_string'})){
					$custom_variable_by_user_string = $calldata{'custom_variable_by_user_string'};
				}

				$custom_variable_by_user_bool = "false";
				if(isset($calldata{'custom_variable_by_user_bool'})){
					$custom_variable_by_user_bool = json_decode($calldata{'custom_variable_by_user_bool'});
				} 
			*/
?>

		<style>
			body{
				margin:0;
				/* padding:20px !important; */
			}
		</style>
        <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Roboto:300,400,500">
        <link rel="stylesheet" href="https://fonts.googleapis.com/icon?family=Material+Icons">

    </head>
    <body>
    <script type="text/javascript">

		
		$LTI = {};
		$LTI['id'] = '<?php echo $lti_id; ?>';
		$LTI['userID'] = '<?php echo $user_id; ?>';
		$LTI['courseID'] = '<?php echo addslashes($course_id); ?>';
		$LTI['user_role'] = '<?php echo $user_roles; ?>';
		
		$JWT_TOKEN = '<?php echo $jwt_encode_token; ?>';
		
	</script>
    <div id="app"></div>
    <script type="text/javascript" src="./dist/bundle.js"></script>
    </body>
</html>
