<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>ReactJS PHP LTI</title>
         <?php

        	require_once('./config.php');
            require_once('./lib/lti.php');
            
			$lti = new Lti($config,true);
            if(!$lti->is_valid()) {
                echo("LTI Not Valid");
        		die();
        	}

            $lti_id = $lti->lti_id();
			$user_id = $lti->user_id();
			$course_id = $lti->course_id();
			$lti_user_roles = $lti->user_roles();
			
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
			
		?>
		<style>
			body{
				margin:0;
				padding:20px !important;
			}
		</style>
    </head>
    <body>
    <script type="text/javascript">

		$LTI_courseID = '<?php echo $course_id ?>';
		$LTI_resourceID = '<?php echo $lti_id ?>';
		$LTI_userID = '<?php echo $user_id ?>';
		$LTI_user_roles = '<?php echo $lti_user_roles ?>';
		$LTI_grade_url = '<?php echo $lti_grade_url ?>';
		$LTI_consumer_key = '<?php echo $lti_consumer_key ?>';
		$LTI_result_sourcedid = '<?php echo $result_sourcedid ?>';
		
        console.log("works ", $LTI_courseID);
	</script>
    <div id="app"></div>
        <!-- <script type="text/javascript" src="./build/bundle.js"></script> -->
    </body>
</html>
