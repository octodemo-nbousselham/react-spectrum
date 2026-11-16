/*
 * Copyright 2025 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */

import {fireEvent, pointerMap, render} from '@react-spectrum/test-utils-internal';
import {TextArea, TextField} from '../src/TextField';
import userEvent from '@testing-library/user-event';

describe('TextField', () => {
  it('should focus textarea when tapping invalid icon', async () => {
    let {getByRole} = render(<TextArea label="Description" isInvalid />);

    let textarea = getByRole('textbox');
    // svg doesn't have a role so grab it via queryselector
    let icon = getByRole('presentation').querySelector('svg')!;
    expect(icon).toBeInTheDocument();
    // user event with touch doesn't cause touchEnd to trigger so using fireEvent
    fireEvent.touchStart(icon);
    fireEvent.touchEnd(icon);

    expect(document.activeElement).toBe(textarea);
  });

  it('should label the input with the prefix', () => {
    let {getByRole} = render(<TextField label="Description" prefix="Prefix" />);

    let input = getByRole('textbox');
    let labels = input.getAttribute('aria-labelledby')?.split(' ');
    expect(document.getElementById(labels![1])).toHaveTextContent('Prefix');
  });

  it.each([
    {name: 'TextField', Component: TextField},
    {name: 'TextArea', Component: TextArea}
  ])(
    '$name shows a character count when showCharacterCount and maxLength are set',
    async ({Component}) => {
      let user = userEvent.setup({delay: null, pointerMap});
      let {getByRole, getByText} = render(
        <Component label="Name" showCharacterCount maxLength={10} defaultValue="hello" />
      );

      let input = getByRole('textbox');
      let count = getByText('5/10');
      expect(input.getAttribute('aria-describedby')).toContain(count.id);

      await user.clear(input);
      await user.type(input, 'abc');
      expect(getByText('3/10')).toBeInTheDocument();
    }
  );
});
