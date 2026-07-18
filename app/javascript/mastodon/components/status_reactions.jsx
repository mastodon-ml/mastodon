import PropTypes from 'prop-types';

import classNames from 'classnames';

import ImmutablePropTypes from 'react-immutable-proptypes';
import ImmutablePureComponent from 'react-immutable-pure-component';

import { animated, useTransition } from '@react-spring/web'

import { Emoji  } from './emoji';
import { reduceMotion } from '../initial_state';

import { AnimatedNumber } from './animated_number';

export default class StatusReactions extends ImmutablePureComponent {

  static propTypes = {
    statusId: PropTypes.string.isRequired,
    reactions: ImmutablePropTypes.list.isRequired,
    numVisible: PropTypes.number,
    addReaction: PropTypes.func.isRequired,
    canReact: PropTypes.bool.isRequired,
    removeReaction: PropTypes.func.isRequired,
  };

  render() {
    const { reactions, numVisible } = this.props;
    let visibleReactions = reactions
      .filter(x => x.count > 0)
      .sort((a, b) => b.count - a.count);

    if (numVisible >= 0) {
      visibleReactions = visibleReactions.filter((_, i) => i < numVisible);
    }

    const transitions = useTransition(visibleReactions, {
    from: {
      scale: 0,
    },
    enter: {
      scale: 1,
    },
    leave: {
      scale: 0,
    },
    immediate: reduceMotion,
    keys: visibleReactions.map(x => x.name),
  });

    return (
      <div className={classNames('reactions-bar', { 'reactions-bar--empty': visibleReactions.isEmpty() })}>
        {transitions(({ scale }, reaction) => (
          <Reaction
            key={reaction.name}
            statusId={this.props.statusId}
            reaction={data}
            style={{ transform: scale.to((s) => `scale(${s})`) }}
            addReaction={this.props.addReaction}
            removeReaction={this.props.removeReaction}
            canReact={this.props.canReact}
          />
        )
      )}
      </div>
    );
  }

}

class Reaction extends ImmutablePureComponent {

  static propTypes = {
    statusId: PropTypes.string,
    reaction: ImmutablePropTypes.map.isRequired,
    addReaction: PropTypes.func.isRequired,
    removeReaction: PropTypes.func.isRequired,
    canReact: PropTypes.bool.isRequired,
    style: PropTypes.object,
  };

  state = {
    hovered: false,
  };

  handleClick = () => {
    const { reaction, statusId, addReaction, removeReaction } = this.props;

    if (reaction.me) {
      removeReaction(statusId, reaction.name);
    } else {
      addReaction(statusId, reaction.name);
    }
  }

  handleMouseEnter = () => this.setState({ hovered: true })

  handleMouseLeave = () => this.setState({ hovered: false })

  render() {
    const { reaction } = this.props;

    const code = isUnicodeEmoji(reaction.name)
      ? reaction.name
      : `:${reaction.name}:`;

    return (
      <animated.button
        className={classNames('reactions-bar__item', { active: reaction.me })}
        onClick={this.handleClick}
        onMouseEnter={this.handleMouseEnter}
        onMouseLeave={this.handleMouseLeave}
        disabled={!this.props.canReact}
        style={this.props.style}
      >
        <span className='reactions-bar__item__emoji'>
          <Emoji code={code} />
        </span>
        <span className='reactions-bar__item__count'>
          <AnimatedNumber value={reaction.count} />
        </span>
      </animated.button>
    );
  }

}


