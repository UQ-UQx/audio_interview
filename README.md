# LTI React Template
[![Build Status](https://travis-ci.org/UQ-UQx/react-php-lti.svg?branch=master)](https://travis-ci.org/UQ-UQx/react-php-lti)

Create an LTI provider using React + PHP, with minimal build configuration with opiniontated code formatting using ESlint & Prettier


## Quick Start

#### 1) Start Apache(on port 80) + MySQL
#### 2) Setup Config File - 

##### change the filename
```bash
$ mv public/config.php.example public/config.php.example

```

##### update db details

```php
<?php
    $config = array(
        'lti_keys'=>array(
            'YOUR_CLIENT_KEY'=>'YOUR_CLIENT_SECRET'
        ),
        'use_db'=>true,
        'db'=>array(
            'dbengine'=>'MySQL',
            'hostname'=>'localhost',
            'username'=>'root',
            'password'=>'root',
            'database'=>'test', 
            'charset'=>'utf8mb4'
        ),
        'jwt_key' => 'JWT_SECRET',
    );
?>

```

#### 3) Use `public/api/test_api.sql` to create the test Database
#### 4) Install dependancies and start

```bash

$ yarn
$ yarn start

```
Happy Coding! 😄