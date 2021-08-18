<?php

use DreamSoft\Core\Controller;
/**
 * Created by PhpStorm.
 * User: rafal
 * Date: 31.01.17
 * Time: 20:02
 */
class CountriesController extends Controller
{

    public function __construct($params)
    {
        parent::__construct($params);
    }

    public function index()
    {
        return json_decode(COUNTRIES, true);
    }
}