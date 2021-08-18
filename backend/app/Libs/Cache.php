<?php


namespace DreamSoft\Libs;


class Cache
{
    /**
     * @var Auth
     */
    protected $Auth;

    public function __construct()
    {
        $this->cache = new \DreamSoft\Models\Cache\Cache();
        $this->Auth = new Auth();
    }

    /**
     * @return bool|array
     */
    public function getCached()
    {
        if ($this->notCacheRequest()) {
            return false;
        }
        $key = $this->keyFromRequest();
        $cached = $this->cache->get('ID', $key);
        return $cached ? $cached['content'] : false;
    }

    public function save($jsonResult)
    {
        if ($this->notCacheRequest()) {
            return false;
        }
        $params = [];
        $params['ID'] = $this->keyFromRequest();
        $params['content'] = $jsonResult;
        $this->cache->create($params);
    }

    public function checkValid()
    {
        if (sourceApp === 'manager') {
            if ($_SERVER['REQUEST_METHOD'] == 'POST')
                $this->cache->truncate();
        }
    }

    private function keyFromRequest()
    {
        $keyData = array_merge($_GET, $_POST);
        $keyData['domainID'] = domainID;
        $keyData['uri'] = $_SERVER['REQUEST_URI'];
        $keyData['data'] = file_get_contents('php://input');
        $loggedUser = $this->Auth->getLoggedUser();
        $keyData['userId'] = !$loggedUser ? false : $loggedUser['ID'];
        return md5(json_encode($keyData));
    }

    private function notCacheRequest()
    {
        if (sourceApp === 'manager') {
            return true;
        }
        $personalized_patches = ['users/', 'dp_addresses/', 'payments/', 'auth/', 'dp_statuses/', 'settings/',
            '/getUserAddresses', '/creditLimit', '/newsletter.agreement', '/getPublicSettings/forms',
            '/getCategoryTree', '/myZoneCount','/saveCalculationPublic','/dp_orders'];
        foreach ($personalized_patches as $patch) {
            if (str_contains($_SERVER['REQUEST_URI'], $patch)) {
                return true;
            }
        }
        return false;
    }
}