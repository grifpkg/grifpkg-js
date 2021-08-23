<p align="center"><a href="https://grifpkg.com" target="_blank" rel="noopener noreferrer"><img height="100" src="https://grifpkg.com/assets/logoTextDark.png" alt="grifpkg logo"></a></p>
<p align="center">
<a href="https://discord.com/invite/WETFS8N92t"><img src="https://img.shields.io/discord/622819380958461984.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2" alt="Discord"></a> <a href="https://www.npmjs.com/package/@grifpkg/client"><img src="https://img.shields.io/npm/v/@grifpkg/client.svg?sanitize=true" alt="npmjs"></a>
</p>

# grifpkg's JavaScript wrapper
Welcome to grif's javascript wrapper, built with js, compatible with browser src and module imports; works both on the browser context and on the node context. If you encounter any issues or want to suggest features, please, create an issue.

## Importing
### NodeJS-based projects
Install with npm `npm install @grifpkg/install`, then:

#### Import using ES5 require
```js
const Grif = require("@grifpkg/client")
/*
  Resource and Release classes available through:
Grif.Resource, Grif.Release
*/
```

#### Import using ES6 import
```js
import {Grif, Release, Resource} from ("@grifpkg/client")
```

### Browser-based projects
```html
<script src="https://unpkg.com/@grifpkg/client/target/grifpkg.min.js"></script>
<script>
// only the Grif class is available
const grif = new Grif()
</script>
```

## Usage
Please, avoid querying whenever it's possible, try fetching and caching resources and releases as much as possible; the REST API **has** an usage limit; if your project isn't aiming to create alternative clients for grifpkg but getting resource and release information, these projects are best suited for you:

 - https://spiget.org/documentation/
 - https://github.com/SpigotMC/XenforoResourceManagerAPI

For the folling examples, I'll be using ES6, using import, were the file accessing grifpkg-js should have the wrapper imported with `import {Grif, Release, Resource} from ("@grifpkg/client")` and the top of the file.

### Querying
```js
new Grif().queryResource("resourceName", [optional_resourceAuthorName], [optional, service id; 0=spigot]).then((resources)=>{
if(resources.length<=0) return;
  console.log("top match", resources[0])
})
```

### Resource fetching
```js
Resource.fromId("grifResourceId").then((resource)=>{
 console.log(resource)
})
```

### Release fetching
```js
Release.fromId("releaseId").then((release)=>{
 console.log(release)
})
```

If you don't know the release id, this endpoint it's flexible and supports name-based querying if you know the parent resource
```js
Release.fromId(null, resource, [optional_versionTag_nullOrUndefined_for_latest]).then((release)=>{
 console.log(release)
})
```

 You can access the same function from the Resource context by using

```js
Resource.getRelease(optional_versionTag_nullOrUndefined_for_latest).then((release)=>{
    console.log(release)
})
```

You can also list every single release for a Resource

```js
Resource.getReleases().then((releases)=>{
  console.log(releases)
})
```

### Release downloading
```js
Release.download(optional_username, optional_password).then((downloadableRelease)=>{
  console.log("download using", downloadableRelease.url)
})
```

### Logging in
Grif will automatically login if a session is cached on the local storage, so you only need to run `Grif.login()` once as long as the hostname doesn't change and you don't pass `false` as a login argument.

#### GitHub oAuth (browser-based only)
Login by using GitHub's oAuth popup, must be triggered by a click in order to prevent popup blocking. You can pass false as a login argument (`Grif.login(false)`) for prevent session saving with localStorage; default is `true`.

```js
Grif.login().then((session)=>{
  console.log("logged in" session),
})
```

#### Existing hash
You can find a session hash by logging in using a popup, exploring the localstorage and getting the hash by base64-decoding it, or access `https://api.grifpkg.com/rest/1/login/`, then open the console on the resulting page after logging in with GitHub; you'll get an alert since you opened the URL directly and the parent context isn't available; the hash is available under `data.session.hash`.
```js
const grif = new Grif("sessionHash")
```

### Logging out
```js
const grif = new Grif()
grif.logout()
```

### Suggestions
You can suggest download URLs for any suggestable object, such as Resource or Release. Resource suggestions are useful if all releases have a suggested URL but you still want a default download for new releases.

 - Variables
	 - **{{jsonResult}}**: available only if you has an intermediate JSON request
	 - **{{resourceId}}**: external resource id
	 - **{{resourceName}}**: resource name
	 - **{{releaseVersion}}**: version tag
	 - **{{releaseId}}**: external release id
	 - **{{releaseCreation}}**: creation unix time

The variables may be used on the url schema and on the jsonURL

```js
// no JSON
object.suggest("urlSchema")

// JSON (adds {{jsonResult}} variable); see https://jsonpath.com/
object.suggest("urlSchema", "jsonURL", "jsonPath")
```
