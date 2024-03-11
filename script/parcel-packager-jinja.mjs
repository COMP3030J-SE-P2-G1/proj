import {Packager} from '@parcel/plugin';

export default new Packager({
    async package({bundle}) {
        let promises = [];
        bundle.traverseAssets(async (asset) => {
            console.log(asset.filePath, ':\n', await asset.getCode());
            promises.push(asset.getCode());
        });

        let contents = await Promise.all(promises);
        return {
            contents: contents.join('\n')
        };
    }
});
