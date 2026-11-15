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

import {fireEvent, render} from '@react-spectrum/test-utils-internal';
import {TextArea, TextField} from '../src/TextField';

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

  it('shows a character count below the field', () => {
    let {getAllByRole, getAllByText} = render(
      <>
        <TextField label="Name" showCharacterCount maxLength={20} defaultValue="Ada" />
        <TextArea label="Comment" showCharacterCount maxLength={140} />
      </>
    );

    let counts = getAllByText(/\/(20|140)$/);
    expect(counts.map(count => count.textContent)).toEqual(['3/20', '0/140']);

    let textboxes = getAllByRole('textbox');
    textboxes.forEach((textbox, index) => {
      expect(counts[index]).not.toHaveAttribute('aria-live');
      expect(textbox.getAttribute('aria-describedby')).toContain(counts[index].id);
    });
  });

  it('should label the input with the prefix', () => {
    let {getByRole} = render(<TextField label="Description" prefix="Prefix" />);

    let input = getByRole('textbox');
    let labels = input.getAttribute('aria-labelledby')?.split(' ');
    expect(document.getElementById(labels![1])).toHaveTextContent('Prefix');
  });
});
