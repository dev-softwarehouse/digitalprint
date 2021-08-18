export interface IAdminProject {
    _id: number,
    name: string,
    url: string,
    active: boolean,
    projectMin: string,
    colors: string[],
    activeColors: string[]
}