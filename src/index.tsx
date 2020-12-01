import React from 'react';
import ReactDom from 'react-dom';
import './index.scss'

class Index extends React.Component<{}, {}> {
    constructor (props) {
        super(props);
        this.state = {
            tag: 'all'
        }
    }

    render () {
        return <div>
            helloworld
        </div>
    }
}



ReactDom.render(
    <Index></Index>,
    document.getElementById('container')
);

