<?php


namespace DreamSoft\Controllers\Contents;

use DreamSoft\Core\Controller;

class StylesController extends Controller
{
    public function __construct($params)
    {
        parent::__construct($params);
    }

    /**
     * @return array
     */
    public function mainFile()
    {
        $filePath = STATIC_PATH . companyID . '/styles/' . MAIN_CSS_FILE;

        $isWritable = is_writable($filePath);
        $isReadable = is_readable($filePath);

        $content = '';
        if( $isReadable ) {
            $content = file_get_contents($filePath);
        }

        $chmod = substr(sprintf('%o', fileperms($filePath)), -4);
        $fileOwner = fileowner ( $filePath );
        $fileGroup = filegroup ( $filePath );

        $username = function_exists('posix_getpwuid') ? posix_getpwuid(posix_geteuid())['name'] : getenv('USERNAME');

        return array(
            'chmod' => $chmod,
            'chown' => $fileOwner . ':' . $fileGroup,
            'isWritable' => $isWritable,
            'isReadable' => $isReadable,
            'content' => $content,
            'name' => MAIN_CSS_FILE,
            'username' => $username
        );
    }

    /**
     * @return array
     */
    public function post_mainFile()
    {
        $filePath = STATIC_PATH . companyID . '/styles/' . MAIN_CSS_FILE;

        $post = $this->Data->getAllPost();
        $content = $post['content'];

        $isWritable = is_writable($filePath);

        if( $isWritable && strlen($content) > 0 ) {
            $bytes = file_put_contents($filePath, $content);
        } else {
            return array(
                'response' => false,
                'info' => 'file_not_writable'
            );
        }

        if( $bytes > 0 ) {
            return array(
                'response' => true,
                'info' => 'saved_message'
            );
        }

        return array(
            'response' => false,
            'info' => 'error'
        );
    }

}
