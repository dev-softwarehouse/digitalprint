
import { HomeResx } from "./home";
import { NavigationResx } from "./navigation";
import { FooterResx } from "./footer";
import { NotFoundResx } from "./notfound";

export var Resources = {
    Home: HomeResx,
    Navigation: NavigationResx,
    Footer: FooterResx,
    NotFound: NotFoundResx,
}

export type IResources = typeof Resources;