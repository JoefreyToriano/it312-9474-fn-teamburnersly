<?php
    class user {
        public $userid;
        public $lname;
        public $fname;
        public $username;
        public $email;
        public $password;
        public $usertype;
    
        // Constructor
        public function __construct($userid, $lname, $fname, $username, $email, $password, $usertype) {
            $this->userid = $userid;
            $this->lname = $lname;
            $this->fname = $fname;
            $this->username = $username;
            $this->email = $email;
            $this->password = $password;
            $this->usertype = $usertype;
        }
    
        public function __toString(){
            echo"$lname $fname";
        }

        // Getter methods
        public function getUserId() {
            return $this->userid;
        }
    
        public function getLastName() {
            return $this->lname;
        }
    
        public function getFirstName() {
            return $this->fname;
        }
    
        public function getUsername() {
            return $this->username;
        }
    
        public function getEmail() {
            return $this->email;
        }
    
        public function getPassword() {
            return $this->password;
        }
    
        public function getUserType() {
            return $this->usertype;
        }
    
        // Setter methods (if needed)
        public function setUserId($userid) {
            $this->userid = $userid;
        }
    
        public function setLastName($lname) {
            $this->lname = $lname;
        }
    
        public function setFirstName($fname) {
            $this->fname = $fname;
        }
    
        public function setUsername($username) {
            $this->username = $username;
        }
    
        public function setEmail($email) {
            $this->email = $email;
        }
    
        public function setPassword($password) {
            $this->password = $password;
        }
    
        public function setUserType($usertype) {
            $this->usertype = $usertype;
        }
    }
?>