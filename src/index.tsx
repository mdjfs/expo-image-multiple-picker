/* eslint-disable no-undef */
/* eslint-disable no-void */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable eqeqeq */
/* eslint-disable no-shadow */
/* eslint-disable react-native/no-inline-styles */
import * as MediaLibrary from 'expo-media-library'
import React, { Component, PureComponent, useEffect, useState } from 'react'
import {
  ActivityIndicator,
  BackHandler,
  Dimensions,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import Svg, { Path } from 'react-native-svg'

export type Views = 'album' | 'gallery'
export type Page = MediaLibrary.PagedInfo<MediaLibrary.Asset>
export type Asset = MediaLibrary.Asset
export type Album = MediaLibrary.Album
export type AssetsOptions = MediaLibrary.AssetsOptions

interface SelectedAsset {
  asset: Asset
  uncheck: () => void
}

interface Size {
  width: number
  height: number
}

interface ImagePickerCarouselState {
  page?: Page
  selectedAssets: Map<string, SelectedAsset>
  data: ImageBoxItem[]
}

interface ImagePickerCarouselProps {
  columns: number
  multiple?: boolean
  onSelect?: (images: Asset[]) => void
  albumID?: string
  check?: () => JSX.Element
  selected?: Asset[]
  max?: number
}

interface ImageBoxItem {
  asset: Asset
  size: Size
  onCheck: (checked: boolean, asset: SelectedAsset) => boolean
  isChecked: () => boolean
  check?: () => JSX.Element
}

interface ImageBoxProps {
  item: ImageBoxItem
}

export interface HeaderData {
  view: Views
  goToAlbum?: () => void
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
  selected?: Asset[]
  selectedAlbum?: Album
  onSelectAlbum?: (album: Album | undefined) => void
  limit?: number
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
    height: 130,
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

class ImageBox extends PureComponent<ImageBoxProps> {
  _ismounted = false

  state = {
    checked: this.props.item.isChecked() || false,
  }

  componentDidMount() {
    this._ismounted = true
  }

  componentWillUnmount() {
    this._ismounted = false
  }

  toggle() {
    const checked = !this.state.checked

    const changed = this.props.item.onCheck(checked, {
      uncheck: () => {
        if (this._ismounted) this.setState({ checked: false })
      },
      asset: this.props.item.asset,
    })

    if (changed) this.setState({ checked })
  }

  getCheckedComponent() {
    return this.props.item.check ? (
      this.props.item.check()
    ) : (
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
  }

  render() {
    return (
      <TouchableOpacity
        onPress={this.toggle.bind(this)}
        style={{
          width: this.props.item.size.width,
          height: this.props.item.size.height,
        }}
      >
        <Image
          style={{
            width: this.props.item.size.width,
            resizeMode: 'cover',
            flex: 1,
          }}
          source={{ uri: this.props.item.asset.uri }}
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

export class ImagePickerCarousel extends Component<ImagePickerCarouselProps> {
  _unmounted = false

  state: ImagePickerCarouselState = {
    selectedAssets: new Map(),
    data: [],
  }

  getColumns() {
    return this.props.columns > 0 ? this.props.columns : 2
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
    return Math.ceil((screen.height / size.height) * columns)
  }

  selectedImage(checked: boolean, selected: SelectedAsset) {
    if (
      this.props.max &&
      this.state.selectedAssets.size >= this.props.max &&
      checked
    ) {
      return false
    }
    if (!this.props.multiple) {
      for (const sel of this.state.selectedAssets.values()) {
        sel.uncheck()
      }
      this.state.selectedAssets.clear()
    }
    if (checked) {
      this.state.selectedAssets.set(selected.asset.id, selected)
    } else {
      this.state.selectedAssets.delete(selected.asset.id)
    }
    this.setState({
      selectedAssets: this.state.selectedAssets,
    })
    if (this.props.onSelect) {
      this.props.onSelect(
        [...this.state.selectedAssets.values()].map((s) => s.asset)
      )
    }
    return true
  }

  exists(asset_id: string) {
    return this.state.data.find((data) => data.asset.id === asset_id)
  }

  isChecked(asset_id: string) {
    return this.state.selectedAssets.has(asset_id)
  }

  async fetchNextPage(stack: number): Promise<boolean> {
    const options: AssetsOptions = {
      album: this.props.albumID,
      first: stack,
      sortBy: [MediaLibrary.SortBy.modificationTime],
    }
    if (this.state.page) {
      options.after = this.state.page.endCursor
    }
    const page = await MediaLibrary.getAssetsAsync(options)
    const isLastPage = page.endCursor == this.state.page?.endCursor
    if (!this._unmounted && !isLastPage) {
      this.state.page = page
      const size = this.getImageSize()
      for (const asset of page.assets) {
        if (!this.exists(asset.id)) {
          this.state.data.push({
            asset,
            size,
            isChecked: this.isChecked.bind(this, asset.id),
            onCheck: this.selectedImage.bind(this),
            check: this.props.check,
          })
        }
      }
      this.setState({
        data: this.state.data,
        page: this.state.page,
      })
      return true
    }
    return false
  }

  async fillStartImages() {
    const needFetch = this.getItemsPerScreen()
    const fetched = await this.fetchNextPage(needFetch < 20 ? needFetch : 20)
    if (fetched && this.state.data.length < needFetch)
      await this.fillStartImages()
  }

  selectPropsImages() {
    const assets = this.state.selectedAssets
    for (const selected of this.props.selected ?? []) {
      assets.set(selected.id, {
        asset: selected,
        uncheck: () => {
          const assets = this.state.selectedAssets
          assets.delete(selected.id)
          this.setState({ selectedAssets: assets })
        },
      })
    }
    this.setState({ selectedAssets: assets })
  }

  async componentDidMount() {
    if (this.props.selected && this.props.selected.length > 0) {
      this.selectPropsImages()
    }
    if (this.state.data.length == 0) await this.fillStartImages()
  }

  componentWillUnmount() {
    this._unmounted = true
  }

  render() {
    return (
      <FlatList
        data={this.state.data}
        renderItem={({ item }) => <ImageBox item={item} />}
        numColumns={this.getColumns()}
        keyExtractor={(item) => item.asset.id}
        initialNumToRender={this.getItemsPerScreen()}
        maxToRenderPerBatch={this.getItemsPerScreen()}
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
      />
      <Text style={{ padding: 10, fontSize: 16 }}>{props.album.title}</Text>
    </TouchableOpacity>
  )
}

function DefaultHeader(props: HeaderData) {
  return (
    <View style={styles.defaultHeaderContainer}>
      {props.view == 'gallery' && (
        <>
          {!props.noAlbums && (
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
          {props.imagesPicked == 0 && (
            <>
              {props.album && (
                <Text style={{ fontSize: 20 }}>{props.album.title}</Text>
              )}
              {!props.album && props.multiple && (
                <Text style={{ fontSize: 20 }}>Select the images</Text>
              )}
              {!props.album && !props.multiple && (
                <Text style={{ fontSize: 20 }}>Select an image</Text>
              )}
            </>
          )}
          {props.imagesPicked > 0 && (
            <>
              {props.multiple && (
                <Text style={{ fontSize: 20 }}>
                  Selected {props.imagesPicked} images
                </Text>
              )}
              {!props.multiple && (
                <Text style={{ fontSize: 20 }}>Selected</Text>
              )}
              <Pressable
                style={styles.defaultHeaderButton}
                onPress={props.save}
              >
                <Text style={styles.defaultHeaderButtonText}>SAVE</Text>
              </Pressable>
            </>
          )}
        </>
      )}
      {props.view == 'album' && (
        <>
          <Text style={{ fontSize: 20 }}>Select an album</Text>
        </>
      )}
    </View>
  )
}

export function ImagePicker(props: ImagePickerProps) {
  const [status, requestPermission] = MediaLibrary.usePermissions()

  const [albums, setAlbums] = useState<AlbumData[]>()
  const [selectedAlbum, setSelectedAlbum] = useState<Album | undefined>(
    props.selectedAlbum
  )
  const [selectedAssets, setSelectedAssets] = useState<Asset[]>(
    props.selected ?? []
  )

  async function askPermission() {
    let cancel = false
    try {
      const permission = await requestPermission()
      if (!permission.granted) cancel = true
    } catch {
      cancel = true
    }
    if (cancel && props.onCancel) {
      props.onCancel()
    }
  }

  function goToAlbum() {
    setSelectedAlbum(undefined)
    setSelectedAssets([])
  }

  function handleBackPress() {
    if (selectedAlbum) {
      goToAlbum()
    } else if (props.onCancel) {
      props.onCancel()
    }
    return true
  }

  useEffect(() => {
    if (status && !status.granted) {
      if (status.canAskAgain) {
        askPermission()
      } else if (props.onCancel) {
        props.onCancel()
      }
    }
  }, [status])

  useEffect(() => {
    BackHandler.addEventListener('hardwareBackPress', handleBackPress)

    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
    }
  }, [selectedAlbum])

  useEffect(() => {
    if (props.onSelectAlbum) props.onSelectAlbum(selectedAlbum)
  }, [selectedAlbum])

  async function getAlbums() {
    const data: AlbumData[] = []
    const albums = await MediaLibrary.getAlbumsAsync({
      includeSmartAlbums: true,
    })
    for (const album of albums) {
      const page = await MediaLibrary.getAssetsAsync({
        first: 1,
        album,
        sortBy: [MediaLibrary.SortBy.modificationTime],
      })
      if (page.assets.length > 0) {
        data.push({
          album,
          thumb: page.assets[0],
          goToGallery: setSelectedAlbum,
        })
      }
    }
    setAlbums(data)
  }

  useEffect(() => {
    if (status && status.granted && !albums) {
      getAlbums()
    }
  }, [status])

  const Header = props.theme?.header ? props.theme.header : DefaultHeader
  const Album = props.theme?.album ? props.theme.album : DefaultAlbum

  if (props.noAlbums || selectedAssets.length > 0 || selectedAlbum) {
    return (
      <View style={styles.root}>
        <View style={styles.rootHeader}>
          <Header
            view='gallery'
            imagesPicked={selectedAssets.length}
            picked={selectedAssets.length > 0}
            multiple={props.multiple || false}
            noAlbums={props.noAlbums || false}
            album={selectedAlbum}
            goToAlbum={goToAlbum}
            save={() => (props.onSave ? props.onSave(selectedAssets) : void 0)}
          />
        </View>
        <View style={styles.rootBody}>
          <ImagePickerCarousel
            onSelect={setSelectedAssets}
            albumID={selectedAlbum ? selectedAlbum.id : undefined}
            multiple={props.multiple || false}
            columns={props.galleryColumns || 2}
            check={props.theme?.check}
            selected={selectedAssets}
            max={props.limit}
          />
        </View>
      </View>
    )
  } else {
    return (
      <View style={styles.root}>
        <View style={styles.rootHeader}>
          <Header
            view='album'
            imagesPicked={0}
            multiple={props.multiple || false}
            picked={false}
            noAlbums={props.noAlbums || false}
          />
        </View>
        {albums && (
          <FlatList
            style={styles.rootBody}
            data={albums}
            numColumns={props.albumColumns || 2}
            keyExtractor={(d) => d.album.id}
            renderItem={({ item }) => <Album {...item} />}
          />
        )}
        {!albums && (
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
      </View>
    )
  }
}
