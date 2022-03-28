# Expo Images Picker

Fully customizable image picker for react native,
to select one or multiple images

![Image](https://imgur.com/lRkMQgk.png)

## Installation

Install with expo

```bash
  expo install expo-image-multiple-picker
```

or npm

```bash
  npm i expo-image-multiple-picker
```

## Usage/Examples

```jsx
import { ImagePicker } from 'expo-image-multiple-picker'

function App() {
  return (
    <ImagePicker
      onSave={(assets) => console.log(assets)}
      onCancel={() => console.log('no permissions or user go back')}
    />
  )
}
```

This will show the image picker to select the album
and then select the images

The image picker calls `onSave` when the user selects the images
and calls `onCancel` when don't have permissions or the user wants to go back without select

#### Multiple Selection

```jsx
import { ImagePicker } from 'expo-image-multiple-picker'

function App() {
  return (
    <ImagePicker
      onSave={(assets) => console.log(assets)}
      onCancel={() => console.log('no permissions or user go back')}
      multiple
    />
  )
}
```

The `multiple` property will allow multiple selection

#### Select from all sources

```jsx
import { ImagePicker } from 'expo-image-multiple-picker'

function App() {
  return (
    <ImagePicker
      onSave={(assets) => console.log(assets)}
      onCancel={() => console.log('no permissions or user go back')}
      noAlbums
    />
  )
}
```

The `noAlbums` property will open the gallery without selecting album, showing all the images on the phone

## Customizing

#### Change number of columns in the album or photo viewer

```jsx
import { ImagePicker } from 'expo-image-multiple-picker'

function App() {
  return (
    <ImagePicker
      onSave={(assets) => console.log(assets)}
      onCancel={() => console.log('no permissions or user go back')}
      galleryColumns={3}
      albumColumns={3}
    />
  )
}
```

The `galleryColumns` property will change the number of columns in the image viewer

The `albumColumns` property will change the number of columns in the album viewer

Obviously, there is no selection limit, this is what the image selector looks like with 32 columns (and it works):

![Image](https://imgur.com/nURr9g2.png)

## Theming

Let's make a Whats App style image picker theme

```jsx
import { ImagePicker } from 'expo-image-multiple-picker'

function App() {
  return (
    <ImagePicker
      theme={{
        header: WhatsAppHeader,
        album: WhatsAppAlbum,
        check: WhatsAppCheck,
      }}
      onSave={(assets) => console.log(assets)}
      onCancel={() => console.log('no permissions or user go back')}
      galleryColumns={4}
      multiple
    />
  )
}
```

Looks like

![Image](https://imgur.com/NLBOi7F.png)

---

The `theme` property will take three optionals components:

- header

It is the navigator, and its props is the `HeaderData` interface

```ts
type Album = MediaLibrary.Album

interface HeaderData {
  view: Views
  goToAlbum?: () => void
  imagesPicked: number
  multiple: boolean
  picked: boolean
  album?: Album
  noAlbums: boolean
  save?: () => void
}
```

Important note: The header must have a fixed height, if it resizes when selected the first time, you will experience a nasty scroll top

- album

It is the one who renders the images of the album viewer, and its props is the `AlbumData` interface

```ts
type Asset = MediaLibrary.Asset
type Album = MediaLibrary.Album

interface AlbumData {
  thumb: Asset
  album: Album
  goToGallery: (album: Album) => void
}
```

Important note: If the album doesn't have a fixed height, it just won't show.

- check

It is the component that is displayed when a photo has been selected, has no props

---

Here it is the code of the components for the WhatsApp Theme:

```jsx
const WhatsAppHeader = (props: HeaderData) => {
  return (
    <View
      style={{
        paddingTop: 40,
        padding: 10,
        height: 80,
        width: '100%',
        backgroundColor: '#252f39',
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
    >
      {props.view == 'album' && (
        <Text style={{ color: 'white', fontSize: 20 }}>Select an album</Text>
      )}
      {props.view == 'gallery' && (
        <>
          <TouchableOpacity onPress={props.goToAlbum}>
            <IonIcon name='arrow-back' size={30} color='#EDF8F5' />
          </TouchableOpacity>
          {props.imagesPicked > 0 && (
            <>
              <Text style={{ color: 'white', fontSize: 20 }}>
                {props.imagesPicked} selected
              </Text>
              <TouchableOpacity onPress={props.save}>
                <Text style={{ color: 'white', fontSize: 16 }}>OK</Text>
              </TouchableOpacity>
            </>
          )}
        </>
      )}
    </View>
  )
}
```

```ts
const WhatsAppAlbum = (props: AlbumData) => {
  return (
    <TouchableOpacity
      onPress={() => props.goToGallery(props.album)}
      style={{ flex: 1, height: 200 }}
    >
      <Image
        source={{ uri: props.thumb.uri }}
        style={{ width: '100%', height: '100%' }}
        blurRadius={10}
      ></Image>
      <View
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          backgroundColor: 'rgba(0,0,0,0.2)',
          justifyContent: 'flex-end',
        }}
      >
        <View style={{ padding: 5, flexDirection: 'row' }}>
          <EntypoIcon name='folder' color='white' size={16} />
          <Text
            style={{
              color: 'white',
              fontSize: 16,
              marginLeft: 5,
            }}
          >
            {props.album.title}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  )
}
```

```ts
const WhatsAppCheck = () => {
  return (
    <View
      style={{
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.4)',
      }}
    >
      <FeatherIcon color='white' name='check' size={32} />
    </View>
  )
}
```

## Under the hood

This image picker uses `expo-media-library` under the hood to fetch the photos from the phone

Then it uses FlatList to render the images and does mathematical calculations according to the columns to know what size they will be

The most important thing in the development was to avoid unnecessary rendering and to minimize the rendered components while scrolling

Finally, if I am doing the documentation, it is because it has had an acceptable performance
