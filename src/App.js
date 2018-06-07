import React, { Component } from 'react';
import config from './config'
import {configureUrlQuery, addUrlProps, replaceUrlQuery, UrlQueryParamTypes } from 'react-url-query'
import './App.css';

const urlPropsQueryConfig = {
  URICurrentChannel: { type: UrlQueryParamTypes.string, queryParam: 'ch' },
}

configureUrlQuery({
  addRouterParams: false,
})

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      value: '',
      channel: !this.props.URICurrentChannel ? 'au-top-layout-bw' : this.props.URICurrentChannel,
      url: '',
      channelName: '',
      chConnections: [],
      channelInfo: {},
      images: [],
      loaded: false,
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if (nextProps.URICurrentChannel !== this.props.URICurrentChannel) {
      this.setState({
        channel: nextProps.URICurrentChannel,
      })
    }
  }

  componentDidMount = () => {
    this.getArenaChannel(this.state.channel)
    replaceUrlQuery({'ch': this.state.channel })
  }

  getArenaChannel = (channel) => {
    const getChDetails = fetch(`${config.apiBase}/channels/${channel}`)
    getChDetails.then(resp => resp.json()).then(response => {
      this.setState({
      channelName: response.title, user: response.user.full_name, channelInfo: response, url: 'https://www.are.na/' + response.user.slug + '/' +response.slug})
    })
    const getItems = fetch(`${config.apiBase}/channels/${channel}/contents`)
    getItems.then(resp => resp.json()).then(response => {
      let items = response.contents.filter(function(item){
        return item.class === 'Image' || item.class === 'Text' || item.class === 'Link'
      })
      let itemUrls = items.map((item) => {
        if(item.class === 'Image'){
          return item = {url: item.image.original.url, title: item.title, id: item.id, type: item.class}
        } else if (item.class === 'Text') {
          return item = {content: item.content, title: item.title, id: item.id, type: item.class}
        } else if (item.class === 'Link') {
          return item = {url: item.source.url, image: item.image.original.url, title: item.title, id: item.id, type: item.class}
        } else {
          return undefined
        }
      })
      this.setState({images: itemUrls, loaded: true});
    })
  }

  render() {
    return (
      <div className="">
        {this.state.images.map((d,i) => <img key={i} id={i} src={d.image ? d.image : d.url} width="20%" />) }
      </div>
    );
  }
}

export default addUrlProps({ urlPropsQueryConfig })(App);