import Axios from "axios";
import {IGroup} from '../models';

export default class GroupsService {
    public static getAll(): Promise<IGroup[]> {
        return new Promise((resolve, reject) => {

            return Axios.get(`${process.env.API_URL}/ps_groups/getActiveGroupsPublic`, {})
                .then(resp => {
                    resolve(resp.data)
                })
                .catch(e => {
                    reject(new Error('Error'))
                })

        });
    }
}