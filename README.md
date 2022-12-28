# Expo Images Picker

Fully customizable image picker for react native,
to select one or multiple images

> **Nice features for 4.7.0 version!** More information at the bottom

![Image](https://imgur.com/lRkMQgk.png)

## Installation

Install with expo

```bash
  expo install expo-image-multiple-picker react-native-svg expo-media-library
```

or npm

```bash
  npm i expo-image-multiple-picker react-native-svg expo-media-library
```

or yarn

```bash
  yarn add expo-image-multiple-picker react-native-svg expo-media-library
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

#### Selection limit

```jsx
import { ImagePicker } from 'expo-image-multiple-picker'

function App() {
  return (
    <ImagePicker
      onSave={(assets) => console.log(assets)}
      onCancel={() => console.log('no permissions or user go back')}
      limit={5}
    />
  )
}
```

The `limit` property will limit the number of images selected

#### Common usage

Usually, you want render the picker conditionally inside your logic, there is an example:

```jsx
import { ImagePicker } from 'expo-image-multiple-picker'

function App() {
  const [open, setOpen] = useState(false)

  if (open) {
    return (
      <ImagePicker
        onSave={(assets) => {
          doWhatEverWithTheAssets(assets)
          setOpen(false)
        }}
        onCancel={() => {
          doWhatEverWhenYourUserSucks()
          setOpen(false)
        }}
      />
    )
  }

  return (
    <View>
      <Text>Hello Mars!</Text>
    </View>
  )
}
```

_Important Note_

React Native doesn't provide **fixed** containers. Then, obviously, ensure when you render the picker, is the
unique element on the phone. For `stack screens` you will need the `headerShown: false`

#### (Advanced) Track album and selected assets

We can know and track the album and selected assets. And also call the picker which specific Album or
selected assets. There is a common way to do that:

```jsx
import { ImagePicker, Album, Asset } from 'expo-image-multiple-picker'

function App() {
  const [open, setOpen] = useState(false)
  const [album, setAlbum] = useState<Album | undefined>()
  const [assets, setAssets] = useState<Asset[]>([])

  if (open) {
    return (
      <ImagePicker
        onSave={(assets) => {
          setAssets(assets)
          setOpen(false)
        }}
        onCancel={() => {
          setAssets([])
          setAlbum(undefined)
          setOpen(false)
        }}
        onSelectAlbum={(album) => setAlbum(album)}
        selected={assets}
        selectedAlbum={album}
      />
    )
  }

  return (
    <View>
      <Text>Hello Pluto!</Text>
    </View>
  )
}
```

_Important Note_

React Native doesn't provide **fixed** containers. Then, obviously, ensure when you render the picker, is the
unique element on the phone. For `stack screens` you will need the `headerShown: false`

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

Obviously, there is no selection limit, this is how the image selector looks like with 32 columns (and it works):

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

## 4.7.0 Features

It had been a while without updating the library or touching react native code. But when i realized that the community
really uses this library, with the downloads increasing, issues, feedback, pull request. Was amazing. I love that feedback.

Then, after writing a lot of sweet things, there is the updates:

### + Performance

With the new version of expo-media-library (15.0.0) fetching assets is more faster! And with that, for every fetch, the picker
can fetch until `70` images per time! x3.5 more than old version fetching 20 images per time... (Anyway, its more noticeable with a large number of galleryColumns) (use the last version of expo-media-library if you want this speed)

### Video Support

Yes! We needed that from the start

```jsx
import { ImagePicker } from 'expo-image-multiple-picker'

function App() {
  return (
    <ImagePicker
      onSave={(assets) => console.log(assets)}
      onCancel={() => console.log('no permissions or user go back')}
      video
    />
  )
}
```

The `video` property will make it possible to select videos in addition to images

Also, the component rendered in a video asset is customizable.
The `theme` property will receive `video` param. This param accept
a function with an asset argument returning the JSX.Element

### Time Slider

Do you remember when you select an asset. Then you need uncheck that asset but hey.
You don't remember where is it. Then you need search in the gallery where is it.

Say GOODBYE to the old times. Now we have a **Time Slider**

![Image](https://imgur.com/6OjEvfb.jpg)

Similar to google photos time slider, but with a difference, shows the current assets picked and their position, to find them
in an easy way

```jsx
import { ImagePicker } from 'expo-image-multiple-picker'

function App() {
  return (
    <ImagePicker
      onSave={(assets) => console.log(assets)}
      onCancel={() => console.log('no permissions or user go back')}
      timeSlider
    />
  )
}
```

The `timeSlider` will enable the default time slider for the picker

If you want use your own custom time slider, there is some tips:

```jsx
import { ImagePicker } from 'expo-image-multiple-picker'

function App() {
  return (
    <ImagePicker
      onSave={(assets) => console.log(assets)}
      onCancel={() => console.log('no permissions or user go back')}
      timeSlider
      timeSliderHeight={500}
    />
  )
}
```

The `timeSliderHeight` will adjust the height for the slider

Build your own Custom Slider:

```ts
interface SliderItem {
  date: Date
  top: number
  styles?: ViewStyle
}

interface SliderBalloon extends SliderItem {
  quantity: number
}

export interface SliderData {
  balloons: SliderBalloon[]
  button?: SliderItem
  height: number
  isMoving: boolean
  buttonProps?: ViewProps
}
```

The `theme` property will receive `slider` param. This param accept
a function with an `SliderData` argument returning the JSX.Element

## Under the hood

This image picker uses `expo-media-library` under the hood to fetch the photos from the phone

Then it uses FlatList to render the images and does mathematical calculations according to the columns to know what size they will be

The most important thing in the development was to avoid unnecessary rendering and to minimize the rendered components while scrolling

Finally, if I am doing the documentation, it is because it has had an acceptable performance
