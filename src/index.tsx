import * as MediaLibrary from 'expo-media-library';
import React, { Component, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  ListRenderItemInfo,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import Svg, { Path } from 'react-native-svg';

export type Views = 'album' | 'gallery'
export type Page = MediaLibrary.PagedInfo<MediaLibrary.Asset>
export type Asset = MediaLibrary.Asset
export type Album = MediaLibrary.Album

interface SelectedAsset {
  setStatus: (status: boolean) => void
  status: boolean
}

interface ImagePickerCarouselState {
  page?: Page
  assets: Map<string, Asset>
  selectedAssets: Map<string, SelectedAsset>
  recentFetched?: boolean
}

interface ImagePickerCarouselProps {
  columns?: number
  multiple?: boolean
  onSelect?: (images: Asset[]) => void
  albumID?: string
  check?: () => JSX.Element
}

interface ImageBoxProps {
  imageSize: { width: number; height: number }
  uri: string
  checked?: boolean
  onSelect?: (params: SelectedAsset) => void
  checkedComponent?: JSX.Element
}

export interface HeaderData {
  view: Views
  goToAlbum: () => void
  imagesPicked: number
  multiple: boolean
  picked: boolean
  album?: Album
  noAlbums: boolean
  save?: () => void
}

export interface AlbumData {
  thumb: Asset
  album: Album
  goToGallery: (album: Album) => void
}

export interface ImagePickerTheme {
  header?: (props: HeaderData) => JSX.Element
  album?: (props: AlbumData) => JSX.Element
  check?: () => JSX.Element
}

export interface ImagePickerProps {
  galleryColumns?: number
  albumColumns?: number
  theme?: ImagePickerTheme
  noAlbums?: boolean
  multiple?: boolean
  onSave?: (images: Asset[]) => void
  onCancel?: () => void
}

const screen = Dimensions.get('window')

const styles = StyleSheet.create({
  root: {
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  rootHeader: {
    width: '100%',
    backgroundColor: 'black',
  },
  rootBody: {
    flex: 1,
    width: '100%',
  },
  container: {
    flex: 1,
  },
  defaultCheckedBg: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0,0,0,0.2)',
  },
  defaultCheckedContainer: {
    position: 'absolute',
    right: '10%',
    bottom: '20%',
    width: '30%',
    height: '30%',
  },
  defaultAlbumContainer: {
    flex: 1,
    margin: 10,
    backgroundColor: 'white',
    height: 'auto',
    borderRadius: 5,
    alignItems: 'center',
    shadowColor: 'black',
    elevation: 1,
  },
  defaultAlbumImage: {
    backgroundColor: 'black',
    width: '100%',
    minHeight: 200,
    resizeMode: 'contain',
  },
  defaultHeaderContainer: {
    width: '100%',
    paddingTop: 80,
    padding: 20,
    justifyContent: 'space-between',
    flexDirection: 'row',
    backgroundColor: 'white',
    elevation: 1,
  },
  defaultHeaderButton: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    elevation: 3,
    backgroundColor: 'black',
  },
  defaultHeaderButtonText: {
    fontSize: 14,
    letterSpacing: 0.25,
    color: 'white',
  },
})

class ImageBox extends Component<ImageBoxProps> {
  _ismounted = false

  state = {
    checked: this.props.checked || false,
  }

  sendSelect(status: boolean) {
    this.setState(
      {
        checked: status,
      },
      () => {
        if (this.props.onSelect) {
          const cb = (checked: boolean) => {
            if (this._ismounted) {
              this.setState({
                checked,
              })
            }
          }
          this.props.onSelect({ status: this.state.checked, setStatus: cb })
        }
      }
    )
  }

  componentDidMount() {
    this._ismounted = true
  }

  componentWillUnmount() {
    this._ismounted = false
  }

  shouldComponentUpdate(_: ImageBoxProps, newState: { checked: boolean }) {
    if (newState.checked != this.state.checked) {
      return true
    }
    return false
  }

  getCheckedComponent() {
    return (
      this.props.checkedComponent || (
        <View style={styles.defaultCheckedBg}>
          <View style={styles.defaultCheckedContainer}>
            <Svg viewBox='0 0 512 512'>
              <Path
                fill='white'
                d='M0 256C0 114.6 114.6 0 256 0C397.4 0 512 114.6 512 256C512 397.4 397.4 512 256 512C114.6 512 0 397.4 0 256zM371.8 211.8C382.7 200.9 382.7 183.1 371.8 172.2C360.9 161.3 343.1 161.3 332.2 172.2L224 280.4L179.8 236.2C168.9 225.3 151.1 225.3 140.2 236.2C129.3 247.1 129.3 264.9 140.2 275.8L204.2 339.8C215.1 350.7 232.9 350.7 243.8 339.8L371.8 211.8z'
              />
            </Svg>
          </View>
        </View>
      )
    )
  }

  render() {
    return (
      <TouchableOpacity
        onPress={() => this.sendSelect(!this.state.checked)}
        style={{
          flex: 1,
          width: this.props.imageSize.width,
          height: this.props.imageSize.height,
        }}
      >
        <Image
          style={{
            width: this.props.imageSize.width,
            resizeMode: 'cover',
            flex: 1,
          }}
          source={{ uri: this.props.uri }}
        />

        <View
          style={{
            ...styles.root,
            opacity: this.state.checked ? 1 : 0,
          }}
        >
          {this.getCheckedComponent()}
        </View>
      </TouchableOpacity>
    )
  }
}

class ImagePickerCarousel extends Component<ImagePickerCarouselProps> {
  _unmounted = false

  state: ImagePickerCarouselState = {
    assets: new Map(),
    selectedAssets: new Map(),
    recentFetched: false,
  }

  getColumns() {
    return this.props.columns && this.props.columns > 0 ? this.props.columns : 2
  }

  isMultiple() {
    return this.props.multiple || false
  }

  getImageSize() {
    const width = screen.width / this.getColumns()
    return {
      width,
      height: width,
    }
  }

  getItemsPerScreen() {
    const columns = this.getColumns()
    const size = this.getImageSize()
    return Math.floor((screen.height / size.height) * columns) + columns
  }

  shouldComponentUpdate(
    _: ImagePickerCarouselProps,
    nextState: ImagePickerCarouselState
  ) {
    if (nextState.recentFetched) {
      this.setState({
        recentFetched: false,
      })
      return true
    }
    return false
  }

  async fetchNextPage(stack: number, cb?: () => void) {
    const images = this.state.assets
    const page = await MediaLibrary.getAssetsAsync({
      album: this.props.albumID,
      first: stack,
      sortBy: [[MediaLibrary.SortBy.creationTime, false]],
      after: this.state.page ? this.state.page.endCursor : '0',
    })
    for (const asset of page.assets) {
      images.set(asset.id, asset)
    }
    if (!this._unmounted)
      this.setState(
        {
          assets: images,
          recentFetched: true,
          page,
        },
        cb
      )
  }

  fillStartImages() {
    const needFetch = this.getItemsPerScreen()
    this.fetchNextPage(needFetch < 20 ? needFetch : 20, () => {
      if (this.state.assets.size < needFetch) {
        this.fillStartImages()
      }
    })
  }

  componentDidMount() {
    this.fillStartImages()
  }

  componentWillUnmount() {
    this._unmounted = true
  }

  select(id: string, params: SelectedAsset) {
    const selected = this.state.selectedAssets
    if (params.status) {
      if (!this.isMultiple()) {
        for (const img of selected.values()) {
          img.setStatus(false)
        }
        selected.clear()
      }
      selected.set(id, params)
    } else {
      selected.delete(id)
    }
    this.setState(
      {
        selectedAssets: selected,
      },
      () => {
        if (this.props.onSelect) {
          const items = new Map(this.state.assets)
          for (const id of items.keys()) {
            if (!this.isChecked(id)) {
              items.delete(id)
            }
          }
          this.props.onSelect([...items.values()])
        }
      }
    )
  }

  isChecked(id: string) {
    return this.state.selectedAssets.has(id)
  }

  renderItem({ item }: ListRenderItemInfo<Asset>): JSX.Element {
    const imageSize = this.getImageSize()
    const checked = this.isChecked(item.id)
    return (
      <ImageBox
        uri={item.uri}
        imageSize={imageSize}
        checked={checked}
        onSelect={(params) => this.select(item.id, params)}
        checkedComponent={this.props.check ? this.props.check() : undefined}
      ></ImageBox>
    )
  }

  render() {
    return (
      <FlatList
        data={Array.from(this.state.assets.values())}
        numColumns={this.getColumns()}
        initialNumToRender={this.getItemsPerScreen()}
        renderItem={this.renderItem.bind(this)}
        keyExtractor={(item) => item.id}
        onEndReached={() => this.fetchNextPage(this.getItemsPerScreen())}
      />
    )
  }
}

function DefaultAlbum(props: AlbumData) {
  return (
    <TouchableOpacity
      style={styles.defaultAlbumContainer}
      onPress={() => props.goToGallery(props.album)}
    >
      <Image
        style={styles.defaultAlbumImage}
        source={{ uri: props.thumb.uri }}
      ></Image>
      <Text style={{ padding: 10, fontSize: 16 }}>{props.album.title}</Text>
    </TouchableOpacity>
  )
}

function DefaultHeader(props: HeaderData) {
  return (
    <View style={styles.defaultHeaderContainer}>
      {props.view == 'gallery' && !props.noAlbums && (
        <TouchableOpacity
          style={{ width: 30, height: 30 }}
          onPress={props.goToAlbum}
        >
          <Svg viewBox='0 0 256 512' {...props}>
            <Path
              fill='black'
              d='M192 448c-8.188 0-16.38-3.125-22.62-9.375l-160-160c-12.5-12.5-12.5-32.75 0-45.25l160-160c12.5-12.5 32.75-12.5 45.25 0s12.5 32.75 0 45.25L77.25 256l137.4 137.4c12.5 12.5 12.5 32.75 0 45.25C208.4 444.9 200.2 448 192 448z'
            />
          </Svg>
        </TouchableOpacity>
      )}
      {!props.picked && !props.album && (
        <Text style={{ fontSize: 20 }}>Select an album</Text>
      )}
      {!props.picked && props.album && (
        <Text style={{ fontSize: 20 }}>{props.album.title}</Text>
      )}
      {props.picked && (
        <Text style={{ fontSize: 20 }}>
          Selected {props.imagesPicked} images
        </Text>
      )}
      {props.picked && (
        <Pressable style={styles.defaultHeaderButton} onPress={props.save}>
          <Text style={styles.defaultHeaderButtonText}>SAVE</Text>
        </Pressable>
      )}
    </View>
  )
}

export function ImagePicker(props: ImagePickerProps) {
  const [status, requestPermission] = MediaLibrary.usePermissions()

  const [albumID, setAlbumID] = useState<string>()

  const [headerData, setHeaderData] = useState<HeaderData>({
    view: props.noAlbums ? 'gallery' : 'album',
    imagesPicked: 0,
    multiple: props.multiple || false,
    noAlbums: props.noAlbums || false,
    picked: false,
    goToAlbum,
  })

  const [albumData, setAlbumData] = useState<AlbumData[]>()

  const [selected, setSelected] = useState<Asset[]>([])

  const albumColumns = props.albumColumns || 2

  function goToAlbum() {
    setHeaderData({ ...headerData, view: 'album' })
  }

  function goToGallery(album: Album) {
    const data = headerData
    data.view = 'gallery'
    if (album) {
      data.album = album
      setAlbumID(album.id)
    }
    setHeaderData(data)
  }

  async function loadAlbumData() {
    const permissions = await MediaLibrary.getPermissionsAsync()
    if (permissions.granted) {
      const data = albumData || []
      const albums = await MediaLibrary.getAlbumsAsync()
      for (const album of albums) {
        const thumb = await MediaLibrary.getAssetsAsync({
          first: 1,
          album,
          sortBy: [[MediaLibrary.SortBy.creationTime, false]],
        })
        if (thumb.assets.length > 0) {
          data.push({
            album,
            thumb: thumb.assets[0],
            goToGallery,
          })
        }
      }
      setAlbumData(data)
    }
  }

  function handleBack(): boolean {
    if (headerData.view == 'album') {
      if (props.onCancel) props.onCancel()
    } else {
      goToAlbum()
    }
    return true
  }

  useEffect(() => {
    if (!status) {
      requestPermission()
        .then((res) => {
          if (!res.granted && props.onCancel) props.onCancel()
        })
        .catch(props.onCancel)
    }
  }, [status])

  useEffect(() => {
    if (status) {
      BackHandler.addEventListener('hardwareBackPress', handleBack)
      return () => {
        BackHandler.removeEventListener('hardwareBackPress', handleBack)
      }
    }
  }, [status])

  useEffect(() => {
    if (!albumData || albumData.length == 0) loadAlbumData()
  })

  useEffect(() => {
    if (selected.length == 0) {
      setHeaderData({ ...headerData, imagesPicked: 0, picked: false })
    } else {
      setHeaderData({
        ...headerData,
        imagesPicked: selected.length,
        picked: true,
        save: () => {
          if (props.onSave) props.onSave(selected)
        },
      })
    }
  }, [selected])

  const Header = props.theme?.header ? props.theme.header : DefaultHeader
  const Album = props.theme?.album ? props.theme.album : DefaultAlbum

  function renderAlbumItem({ item }: ListRenderItemInfo<AlbumData>) {
    return <Album {...item} />
  }

  return (
    <View style={styles.root}>
      {headerData && (
        <View style={styles.rootHeader}>
          <Header {...headerData} />
        </View>
      )}
      {headerData.view == 'album' && (
        <>
          {albumData && (
            <FlatList
              style={styles.rootBody}
              data={albumData}
              numColumns={albumColumns}
              keyExtractor={(d) => d.album.id}
              renderItem={renderAlbumItem}
            />
          )}
          {!albumData && (
            <View
              style={{
                ...styles.rootBody,
                alignContent: 'center',
                justifyContent: 'center',
              }}
            >
              <ActivityIndicator size={48} color='blue' />
            </View>
          )}
        </>
      )}
      {headerData.view == 'gallery' && (
        <View style={styles.rootBody}>
          <ImagePickerCarousel
            albumID={albumID}
            onSelect={setSelected}
            multiple={props.multiple}
            columns={props.galleryColumns}
            check={props.theme?.check}
          />
        </View>
      )}
    </View>
  )
}
