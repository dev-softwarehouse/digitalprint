<?php

use PHPUnit\Framework\TestCase;
class RoutingTest extends TestCase
{

    private $instance;

    public function setUp():void
    {
        global $_SERVER;
        $_SERVER['REQUEST_URI']='/';
        $_SERVER['REQUEST_METHOD']='get';
        $this->instance = new \DreamSoft\Libs\Routing();
    }

    /**
     * @dataProvider parseUriData
     */
    public function testParseUri($uri,$package,$controller)
    {
        $_SERVER['REQUEST_URI']=$uri;
        $this->instance->parseUri();
        $this->assertSame($package,$this->instance->getPackage());
        $this->assertSame($controller,$this->instance->getController());

    }

    public function parseUriData()
    {
        return [
            ['/ps_attributes/1/ps_options/514/increaseControllers/1/ps_config_increases','printshop_config','IncreasesConfigController']
            ,['/ps_attributes/1/ps_options/514/increaseControllers/0/ps_config_related_increases_count', 'printshop_config','IncreasesConfigController']];
    }
}
