/*
 * Copyright 2020 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

jest.mock('../../src/live-announcer/LiveAnnouncer');
import {actHook, renderHook} from '@react-spectrum/test-utils-internal';
import {announce} from '../../src/live-announcer/LiveAnnouncer';
import React from 'react';
import {useTextField} from '../../src/textfield/useTextField';

describe('useTextField hook', () => {
  let renderTextFieldHook = props => {
    let {result} = renderHook(() => useTextField(props, React.createRef()));
    return result.current.inputProps;
  };

  let renderTextFieldHookResult = props => {
    let {result} = renderHook(() => useTextField(props, React.createRef()));
    return result;
  };

  describe('should return textFieldProps', () => {
    it('with default textfield props if no props are provided', () => {
      using consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      let props = renderTextFieldHook({});
      expect(props.type).toBe('text');
      expect(props.disabled).toBeFalsy();
      expect(props.readOnly).toBeFalsy();
      expect(props['aria-invalid']).toBeUndefined();
      expect(props['aria-required']).toBeUndefined();
      expect(typeof props.onChange).toBe('function');
      expect(props.autoFocus).toBeFalsy();
      expect(consoleWarnSpy).toHaveBeenLastCalledWith(
        'If you do not provide a visible label, you must specify an aria-label or aria-labelledby attribute for accessibility'
      );
    });

    it('with appropriate props if type is defined', () => {
      let type = 'search';
      let props = renderTextFieldHook({type, 'aria-label': 'mandatory label'});
      expect(props.type).toBe(type);
    });

    it('with appropriate props if isDisabled is defined', () => {
      let props = renderTextFieldHook({isDisabled: true, 'aria-label': 'mandatory label'});
      expect(props.disabled).toBeTruthy();

      props = renderTextFieldHook({isDisabled: false, 'aria-label': 'mandatory label'});
      expect(props.disabled).toBeFalsy();
    });

    it('with appropriate props if isRequired is defined', () => {
      let props = renderTextFieldHook({isRequired: true, 'aria-label': 'mandatory label'});
      expect(props['aria-required']).toBeTruthy();

      props = renderTextFieldHook({isRequired: false, 'aria-label': 'mandatory label'});
      expect(props['aria-required']).toBeUndefined();
    });

    it('with appropriate props if isReadOnly is defined', () => {
      let props = renderTextFieldHook({isReadOnly: true, 'aria-label': 'mandatory label'});
      expect(props.readOnly).toBeTruthy();

      props = renderTextFieldHook({isReadOnly: false, 'aria-label': 'mandatory label'});
      expect(props.readOnly).toBeFalsy();
    });

    it('with appropriate props if validationState is defined', () => {
      let props = renderTextFieldHook({
        validationState: 'invalid',
        'aria-label': 'mandatory label'
      });
      expect(props['aria-invalid']).toBeTruthy();

      props = renderTextFieldHook({validationState: 'valid', 'aria-label': 'mandatory label'});
      expect(props['aria-invalid']).toBeUndefined();
    });

    it('with appropriate props if autoCapitalize is defined', () => {
      let props = renderTextFieldHook({autoCapitalize: 'on', 'aria-label': 'mandatory label'});
      expect(props.autoCapitalize).toBe('on');

      props = renderTextFieldHook({autoCapitalize: 'off', 'aria-label': 'mandatory label'});
      expect(props.autoCapitalize).toBe('off');
    });

    it('with an onChange that calls user specified onChange with appropriate values', () => {
      let onChange = jest.fn();
      let props = renderTextFieldHook({onChange, 'aria-label': 'mandatory label'});
      let mockEvent = {
        target: {
          value: 1
        }
      };

      actHook(() => props.onChange(mockEvent));
      expect(onChange).toHaveBeenCalledTimes(1);
      expect(onChange).toHaveBeenCalledWith(mockEvent.target.value);
      onChange.mockClear();
    });

    it('without type prop if inputElementType is textarea', () => {
      let type = 'search';
      let pattern = /pattern/;
      let props = renderTextFieldHook({
        type,
        pattern,
        inputElementType: 'textarea',
        'aria-label': 'mandatory label'
      });
      expect(props.type).toBeUndefined();
      expect(props.pattern).toBeUndefined();
    });
  });

  describe('character count', () => {
    afterEach(() => {
      announce.mockClear();
    });

    it('is inactive when showCharacterCount is false', () => {
      let result = renderTextFieldHookResult({
        'aria-label': 'mandatory label',
        maxLength: 10,
        defaultValue: 'hello'
      });
      expect(result.current.characterCountText).toBeNull();
      expect(result.current.characterCountProps.id).toBeUndefined();
      expect(result.current.inputProps['aria-describedby']).toBeUndefined();
      expect(announce).not.toHaveBeenCalled();
    });

    it('is inactive when maxLength is unset', () => {
      let result = renderTextFieldHookResult({
        'aria-label': 'mandatory label',
        showCharacterCount: true,
        defaultValue: 'hello'
      });
      expect(result.current.characterCountText).toBeNull();
      expect(result.current.characterCountProps.id).toBeUndefined();
      expect(announce).not.toHaveBeenCalled();
    });

    it('includes the counter id in aria-describedby and formats the count text', () => {
      let result = renderTextFieldHookResult({
        'aria-label': 'mandatory label',
        showCharacterCount: true,
        maxLength: 10,
        defaultValue: 'hello'
      });
      expect(result.current.characterCountText).toBe('5/10');
      expect(result.current.characterCountProps.id).toBeDefined();
      expect(result.current.inputProps['aria-describedby']).toBe(
        result.current.characterCountProps.id
      );
    });

    it('updates the count text when the value changes', () => {
      let result = renderTextFieldHookResult({
        'aria-label': 'mandatory label',
        showCharacterCount: true,
        maxLength: 10,
        defaultValue: ''
      });
      expect(result.current.characterCountText).toBe('0/10');

      actHook(() => {
        result.current.inputProps.onChange({target: {value: 'abc'}});
      });
      expect(result.current.characterCountText).toBe('3/10');
    });

    it('announces remaining characters only in the approaching zone', () => {
      let result = renderTextFieldHookResult({
        'aria-label': 'mandatory label',
        showCharacterCount: true,
        maxLength: 100,
        defaultValue: ''
      });
      expect(announce).not.toHaveBeenCalled();

      actHook(() => {
        result.current.inputProps.onChange({target: {value: 'a'.repeat(50)}});
      });
      expect(announce).not.toHaveBeenCalled();

      actHook(() => {
        result.current.inputProps.onChange({target: {value: 'a'.repeat(90)}});
      });
      expect(announce).toHaveBeenCalledTimes(1);
      expect(announce).toHaveBeenCalledWith('10 characters remaining', 'polite');

      actHook(() => {
        result.current.inputProps.onChange({target: {value: 'a'.repeat(91)}});
      });
      expect(announce).toHaveBeenCalledTimes(2);
      expect(announce).toHaveBeenLastCalledWith('9 characters remaining', 'polite');

      actHook(() => {
        result.current.inputProps.onChange({target: {value: 'a'.repeat(91)}});
      });
      expect(announce).toHaveBeenCalledTimes(2);
    });
  });
});
