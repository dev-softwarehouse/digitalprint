<?php
/**
 * Programmer Rafał Leśniak - 18.9.2017
 */

/**
 * Created by PhpStorm.
 * User: Rafał
 * Date: 18-09-2017
 * Time: 14:56
 */

namespace DreamSoft\Controllers\Others;

use DreamSoft\Core\Controller;
use DreamSoft\Models\Setting\Setting;

class NewsController extends Controller
{
    /**
     * @var Setting
     */
    protected $Setting;

    public function __construct(array $parameters = array())
    {
        parent::__construct($parameters);
        $this->Setting = Setting::getInstance();
    }

    public function setDomainID($ID)
    {
        parent::setDomainID($ID);
        $this->Setting->setDomainID($ID);
    }

    public function index()
    {

    }

    public function rss()
    {
        $this->Setting->setModule('additionalSettings');
        $this->Setting->setLang(NULL);

        $rssUrl = $this->Setting->getValue('rssFeed');
        $rssCharLimit = $this->Setting->getValue('rssCharLimit');

        if(!$rssUrl) {
            return array();
        }

        if (!($xml = simplexml_load_file($rssUrl))) {
            return array();
        }


        $articles = array();

        foreach ($xml->channel->item as $item)
        {
            $one['pubDate'] = date('Y-m-d H:i:s', strtotime($item->pubDate));
            $one['timestamp'] = strtotime($item->pubDate).'000';
            $one['link'] = (string) $item->link;
            $one['title'] = (string) $item->title;

            $one['description'] = filter_var($item->description, FILTER_SANITIZE_STRING);

            $description = $item->description->__toString();

            $hasParagraphs = strpos($description, '<p>');
            if($hasParagraphs !== false) {
                $stripDescription = $this->stripCdata($description);
                $matches = array();
                preg_match("/<p>(.*?)<\/p>/", $stripDescription, $matches);
                if( array_key_exists(1, $matches ) && strlen($matches[1]) > 1 ) {
                    $one['description'] = $matches[1];
                }
            }

            $numberOfWords = $this->getNumberOfWords($one['description'], $rssCharLimit);

            $splitText = explode(' ', $one['description']);

            if( $numberOfWords > 0 ) {
                $one['shortDescription'] = implode(' ',array_slice($splitText, 0, $numberOfWords)). '...';
            } else {
                $one['shortDescription'] = $one['description'];
            }

            $contentEncoded     = $item->children("content", true);
            $encoded     = (string)$contentEncoded->encoded;

            preg_match('/\<img.*src\=\"(.*)\"/U', $encoded, $matches);
            $one['image'] = NULL;
            if( $matches ) {
                $one['image'] = $matches[1];
            }
            $one['comments'] = (string) $item->comments;

            $articles[] = $one;
        }

        return array(
            'items' => $articles,
            'title' => (string) $xml->channel->title,
            'link' => (string) $xml->channel->link,
            'description' => (string) $xml->channel->description
        );
    }

    public function stripCdata($string)
    {
        preg_match_all('/<!\[cdata\[(.*?)\]\]>/is', $string, $matches);
        return str_replace($matches[0], $matches[1], $string);
    }

    /**
     * @param $description
     * @param $limit
     * @return int
     */
    private function getNumberOfWords($description, $limit)
    {
        $wordIndex = 0;
        $chars = 0;

        $splitText = explode(' ', $description);
        $countWords = count($splitText);

        if( $countWords < 1 ) {
            return 0;
        }

        for($i=0;$i<$countWords;$i++) {
            $chars += strlen($splitText[$i]);
            if ($chars <= $limit) {
                $wordIndex++;
            }

            if (($chars > $limit) || $i === ($countWords - 1)) {
                return $wordIndex;
            }
        }

        return 0;
    }


}