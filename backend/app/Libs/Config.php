<?php
/**
 * Created by PhpStorm.
 * User: lenovo
 * Date: 18.01.19
 * Time: 09:56
 */

namespace DreamSoft\Libs;
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception as PHPMailerException;

class Config extends Debugger
{
    private $options;
    private $default;


    public function __construct()
    {
        $this->setDefault(1);
        $this->setDebugFile('config');
    }

    public function setOptions($options)
    {
        $this->options = $options;
    }

    public function getOptions()
    {
        return $this->options;
    }

    public function setDefault($default)
    {
        $this->default = $default;
    }

    /**
     * @return mixed
     */
    public function getDefault()
    {
        return $this->default;
    }

    /**
     * @param $subject
     * @param $body
     * @param $mail_to
     * @param string $name_to
     * @return array|bool
     */
    public function sendMail($subject, $body, $mail_to, $name_to = '')
    {
        $options = $this->getOptions();
        if( empty($options) && $this->getDefault() ){
            $options['host'] = 'legal.home.pl';
            $options['username'] = 'biuro@vprojekt.eu';
            $options['passwd'] = '!@#$Legal%^&*LM';
            $options['port'] = 587;
            $options['from'] = 'office@digitalprint.pro';
            $options['fromName'] = 'Drukarnia cyfrowa!';
        }

        try {

            $mail = new PHPMailer(true);
            $mail->isSMTP();
            if( defined('DEFAULT_MAIL_TO_CC') && strlen(DEFAULT_MAIL_TO_CC) > 0 ) {
                $mail->addBCC(DEFAULT_MAIL_TO_CC);
            }

            $mail->CharSet = "UTF-8";
            $mail->Host = $options['host'];
            $mail->Username = $options['username'];
            $mail->Password = $options['passwd'];
            $mail->SMTPAuth = true;
            $mail->Timeout = PHP_MAILER_TIMEOUT;
            if( isset($options['ssl']) && $options['ssl'] == 1 ){
                $mail->SMTPSecure = "ssl";
            }
            $mail->Port = intval($options['port']);
            $mail->setLanguage("pl");
            $mail->From = $options['from'];
            $mail->FromName = $options['fromName'];

            $mail->Subject = $subject;
            $mail->Body = $body;
            $mail->isHTML(true);
            $mail->SMTPOptions = array(
                'ssl' => array(
                    'verify_peer' => false,
                    'verify_peer_name' => false
                )
            );

            if( is_array($mail_to) ){
                foreach ($mail_to as $mails) {
                    if( filter_var($mails['email'], FILTER_VALIDATE_EMAIL) ){
                        $mail->addAddress($mails['email'], $mails['name']);
                    }
                }
            } else {
                $mail->addAddress($mail_to,$name_to);
            }

            $send = $mail->send();

            if( $send ) {
                return true;
            } else {
                return array(
                    'error' => 'uncaught error',
                    'info' => $mail->ErrorInfo
                );
            }

        } catch (PHPMailerException $exception) {
            $this->debug($exception->getMessage());
            return array(
                'error' => $exception->getMessage()
            );
        }

    }
}